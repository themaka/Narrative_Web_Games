// =============================================================================
// useSheetData — Fetches and parses Google Sheet data
// =============================================================================

import { useState, useEffect } from 'react';
import type { StoryNode, Metadata } from '../types';
import { parseStorySheet, parseMetadataSheet } from '../utils/sheetParser';

// ---------------------------------------------------------------------------
// Console logging prefix
// ---------------------------------------------------------------------------
const LOG = '[NWG]';

interface SheetDataResult {
  nodes: Map<string, StoryNode> | null;
  metadata: Metadata | null;
  loading: boolean;
  error: string | null;
  status: string;
}

/** Maps a tab name (lowercased) to its gid */
interface TabInfo {
  name: string;
  gid: string;
}

/**
 * Normalizes various forms of a published Google Sheet URL into a base URL
 * that can be used with both /pubhtml (for tab discovery) and /pub (for CSV export).
 *
 * Users may paste any of these:
 *   .../pubhtml
 *   .../pubhtml?gid=0&single=true
 *   .../pub
 *   .../pub?output=csv
 *   .../pub?gid=0&single=true&output=csv
 *
 * We strip everything after /pub or /pubhtml to get the base:
 *   https://docs.google.com/spreadsheets/d/e/LONG_ID/pub
 */
function normalizeSheetUrl(url: string): string {
  // Remove query params and trailing slashes
  let base = url.split('?')[0].replace(/\/+$/, '');
  // Normalize /pubhtml to /pub
  if (base.endsWith('/pubhtml')) {
    base = base.slice(0, -'/pubhtml'.length) + '/pub';
  }
  // Ensure it ends with /pub
  if (!base.endsWith('/pub')) {
    base += '/pub';
  }
  return base;
}

/**
 * Discovers tab names and gids by fetching the published sheet's HTML page
 * and extracting the sheet metadata from the embedded JavaScript.
 *
 * Google embeds tab info in the /pubhtml page as JavaScript:
 *   items.push({name: "StorySheet", pageUrl: "...gid=0", gid: "0", ...});
 *   items.push({name: "Title", pageUrl: "...gid=1404941206", gid: "1404941206", ...});
 */
async function discoverTabs(baseUrl: string): Promise<TabInfo[]> {
  // Fetch the pubhtml page (which has the embedded JS with tab info)
  const htmlUrl = baseUrl.replace(/\/pub$/, '/pubhtml');
  console.log(LOG, 'Fetching pubhtml for tab discovery:', htmlUrl);
  const response = await fetch(htmlUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }
  const html = await response.text();
  console.log(LOG, `Fetched pubhtml (${html.length} bytes)`);

  const tabs: TabInfo[] = [];

  // Primary strategy: Match the items.push({name: "X", ...gid: "Y"}) pattern
  // Actual format:  items.push({name: "StorySheet", pageU...gid=0", gid: "0",...})
  const pushPattern = /items\.push\(\{name:\s*"([^"]+)".*?gid:\s*"(\d+)"/g;
  let match;
  while ((match = pushPattern.exec(html)) !== null) {
    tabs.push({ name: match[1], gid: match[2] });
  }

  // Fallback: try a broader pattern for name/gid pairs
  if (tabs.length === 0) {
    console.log(LOG, 'Primary regex found no tabs, trying fallback pattern...');
    const broadPattern = /\{name:\s*"([^"]+)"[^}]*gid:\s*"(\d+)"/g;
    while ((match = broadPattern.exec(html)) !== null) {
      tabs.push({ name: match[1], gid: match[2] });
    }
  }

  // Last resort: assume single sheet with gid=0
  if (tabs.length === 0) {
    console.warn(LOG, 'No tabs found in HTML — falling back to single Sheet1 (gid=0)');
    tabs.push({ name: 'Sheet1', gid: '0' });
  }

  return tabs;
}

/**
 * Find a tab by matching against known names (case-insensitive).
 * Supports multiple aliases for flexibility with different sheet naming conventions.
 */
function findTab(tabs: TabInfo[], aliases: string[]): TabInfo | undefined {
  const lowerAliases = aliases.map((a) => a.toLowerCase());
  const found = tabs.find((tab) => lowerAliases.includes(tab.name.toLowerCase()));
  if (found) {
    console.log(LOG, `Tab match: "${found.name}" (gid=${found.gid}) matched aliases [${aliases.join(', ')}]`);
  }
  return found;
}

/**
 * Fetches a published Google Sheet and parses both the story and metadata tabs.
 *
 * Tab discovery: The hook first fetches the published HTML page to discover
 * tab names and their gid values, since Google Sheets uses arbitrary gid
 * numbers (not sequential 0, 1, 2...). It then matches tabs by name.
 */
export function useSheetData(sheetUrl: string | null): SheetDataResult {
  const [nodes, setNodes] = useState<Map<string, StoryNode> | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    if (!sheetUrl) {
      // No URL yet — stay in loading state (config is still being fetched)
      console.log(LOG, 'Waiting for sheet URL (config not loaded yet)...');
      return;
    }

    console.log(LOG, 'Sheet URL received:', sheetUrl);
    let cancelled = false;

    async function fetchSheet() {
      try {
        setStatus('Loading datasheet...');

        // Normalize the URL so users can paste any form of the published URL
        const baseUrl = normalizeSheetUrl(sheetUrl!);
        console.log(LOG, 'Normalized base URL:', baseUrl);

        // Step 1: Discover tabs from the published sheet's HTML page
        const tabs = await discoverTabs(baseUrl);

        if (cancelled) return;
        console.log(LOG, 'Discovered tabs:', tabs.map((t) => `${t.name} (gid=${t.gid})`).join(', '));

        // Step 2: Find the story tab
        const storyTab = findTab(tabs, ['story', 'storysheet', 'storydata']);
        // Fall back to gid=0 (first tab) if no name match
        const storyGid = storyTab?.gid ?? '0';
        if (!storyTab) {
          console.warn(LOG, `No story tab name match — falling back to gid=0 (first tab)`);
        }

        // Step 3: Find the metadata tab
        const metadataTab = findTab(tabs, [
          'metadata', 'meta', 'title', 'config', 'settings',
        ]);

        if (!metadataTab) {
          throw new Error(
            `Could not find a metadata tab. Found tabs: ${tabs.map((t) => t.name).join(', ')}. ` +
            `Expected one of: metadata, meta, title, config, settings.`
          );
        }

        // Step 4: Fetch story CSV
        // CSV export uses the /pub endpoint (not /pubhtml)
        const storyCsvUrl = `${baseUrl}?gid=${storyGid}&single=true&output=csv`;
        console.log(LOG, 'Fetching story CSV:', storyCsvUrl);
        const storyResponse = await fetch(storyCsvUrl);
        if (!storyResponse.ok) {
          throw new Error(`Failed to fetch story data: ${storyResponse.status}`);
        }
        const storyCsv = await storyResponse.text();
        console.log(LOG, `Story CSV fetched (${storyCsv.length} bytes, ~${storyCsv.split('\n').length} rows)`);

        if (cancelled) return;
        setStatus('Parsing story data...');

        const parsedNodes = parseStorySheet(storyCsv);
        console.log(LOG, `Parsed ${parsedNodes.length} story nodes`);
        if (parsedNodes.length > 0) {
          const sample = parsedNodes[0];
          console.log(LOG, 'First node sample:', {
            nodeId: sample.nodeId,
            speaker: sample.speaker,
            text: sample.text?.substring(0, 60) + '...',
            choices: sample.choices.length,
          });
        }

        // Step 5: Fetch metadata CSV
        setStatus('Loading metadata...');
        const metaCsvUrl = `${baseUrl}?gid=${metadataTab.gid}&single=true&output=csv`;
        console.log(LOG, 'Fetching metadata CSV:', metaCsvUrl);
        const metaResponse = await fetch(metaCsvUrl);
        if (!metaResponse.ok) {
          throw new Error(`Failed to fetch metadata tab (gid=${metadataTab.gid}): ${metaResponse.status}`);
        }
        const metaCsv = await metaResponse.text();
        console.log(LOG, `Metadata CSV fetched (${metaCsv.length} bytes):\n${metaCsv}`);

        if (cancelled) return;
        const parsedMetadata = parseMetadataSheet(metaCsv);
        console.log(LOG, 'Parsed metadata:', parsedMetadata);

        setStatus('Loading assets...');

        // Build a Map for O(1) node lookup
        const nodeMap = new Map<string, StoryNode>();
        parsedNodes.forEach((node) => nodeMap.set(node.nodeId, node));

        // If metadata didn't specify a start node, use the first story node
        if (!parsedMetadata.startNode && parsedNodes.length > 0) {
          parsedMetadata.startNode = parsedNodes[0].nodeId;
          console.log(LOG, `No start_node in metadata, defaulting to first node: "${parsedMetadata.startNode}"`);
        }

        if (cancelled) return;

        console.log(LOG, `Ready — ${nodeMap.size} nodes loaded, start="${parsedMetadata.startNode}", title="${parsedMetadata.title}"`);
        setNodes(nodeMap);
        setMetadata(parsedMetadata);
        setLoading(false);
        setStatus('Ready');
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Unknown error loading sheet';
          console.error(LOG, 'Load failed:', message);
          if (err instanceof Error && err.stack) {
            console.error(LOG, err.stack);
          }
          setError(message);
          setLoading(false);
        }
      }
    }

    fetchSheet();

    return () => {
      cancelled = true;
    };
  }, [sheetUrl]);

  return { nodes, metadata, loading, error, status };
}
