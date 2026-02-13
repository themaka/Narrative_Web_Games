// =============================================================================
// useSheetData — Fetches and parses Google Sheet data
// =============================================================================

import { useState, useEffect } from 'react';
import type { StoryNode, Metadata } from '../types';
import { parseStorySheet, parseMetadataSheet } from '../utils/sheetParser';

interface SheetDataResult {
  nodes: Map<string, StoryNode> | null;
  metadata: Metadata | null;
  loading: boolean;
  error: string | null;
  status: string;
}

/**
 * Fetches a published Google Sheet and parses both the story and metadata tabs.
 *
 * Google Sheets published CSV URL format:
 *   {sheetUrl}?gid={SHEET_GID}&single=true&output=csv
 *
 * The story tab is assumed to be gid=0. The metadata tab is the second tab.
 */
export function useSheetData(sheetUrl: string | null): SheetDataResult {
  const [nodes, setNodes] = useState<Map<string, StoryNode> | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    if (!sheetUrl) {
      setError('No sheet URL provided');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSheet() {
      try {
        setStatus('Loading datasheet...');

        // Fetch story tab (gid=0)
        const storyUrl = `${sheetUrl}?gid=0&single=true&output=csv`;
        const storyResponse = await fetch(storyUrl);
        if (!storyResponse.ok) {
          throw new Error(`Failed to fetch story data: ${storyResponse.status}`);
        }
        const storyCsv = await storyResponse.text();

        if (cancelled) return;
        setStatus('Parsing story data...');

        const parsedNodes = parseStorySheet(storyCsv);

        // Fetch metadata tab — we need to discover the gid
        // For published sheets, the metadata tab's gid needs to be known
        // Common approach: try gid based on tab order
        setStatus('Loading metadata...');

        // Try to fetch the second tab. The gid for the second tab varies.
        // We'll try the published sheet's full URL with output=csv which gives tab listing,
        // or use a known pattern. For now, we attempt common gid values.
        const metadataUrl = `${sheetUrl}?gid=1&single=true&output=csv`;
        const metadataResponse = await fetch(metadataUrl);

        let parsedMetadata: Metadata;
        if (metadataResponse.ok) {
          const metadataCsv = await metadataResponse.text();
          parsedMetadata = parseMetadataSheet(metadataCsv);
        } else {
          throw new Error('Failed to fetch metadata tab. Ensure the sheet has a "metadata" tab as the second tab.');
        }

        if (cancelled) return;
        setStatus('Loading assets...');

        // Build a Map for O(1) node lookup
        const nodeMap = new Map<string, StoryNode>();
        parsedNodes.forEach((node) => nodeMap.set(node.nodeId, node));

        setNodes(nodeMap);
        setMetadata(parsedMetadata);
        setLoading(false);
        setStatus('Ready');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error loading sheet');
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
