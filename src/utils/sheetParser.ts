// =============================================================================
// sheetParser — Parses CSV from Google Sheets into typed data
// =============================================================================

import type { StoryNode, Choice, Metadata } from '../types';

// ---------------------------------------------------------------------------
// CSV Parsing
// ---------------------------------------------------------------------------

/**
 * Simple CSV parser that handles quoted fields (which Google Sheets produces).
 * Returns an array of rows, each row being an array of cell values.
 */
function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++; // skip \n in \r\n
      } else if (char === '\r') {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Last cell/row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Story Sheet Parser
// ---------------------------------------------------------------------------

/**
 * Column indices for the 26-column story schema (A-Z)
 */
const STORY_COLUMNS = {
  nodeId: 0,           // A
  speaker: 1,          // B
  text: 2,             // C
  speakerPosition: 3,  // D
  speakerImage: 4,     // E
  leftImage: 5,        // F
  centerImage: 6,      // G
  rightImage: 7,       // H
  bgImage: 8,          // I
  transition: 9,       // J
  choice1Text: 10,     // K
  choice1Target: 11,   // L
  choice1Style: 12,    // M
  choice2Text: 13,     // N
  choice2Target: 14,   // O
  choice2Style: 15,    // P
  choice3Text: 16,     // Q
  choice3Target: 17,   // R
  choice3Style: 18,    // S
  choice4Text: 19,     // T
  choice4Target: 20,   // U
  choice4Style: 21,    // V
  music: 22,           // W
  soundEffect: 23,     // X
  setFlag: 24,         // Y
  requireFlag: 25,     // Z
} as const;

/**
 * Parse a choice from a set of columns. Returns null if no target is defined.
 */
function parseChoice(
  row: string[],
  textCol: number,
  targetCol: number,
  styleCol: number
): Choice | null {
  const target = row[targetCol] || '';
  if (!target) return null;

  const text = row[textCol] || '';
  const style = row[styleCol] as Choice['style'] | undefined;

  return {
    text,
    target,
    style: style === 'danger' || style === 'subtle' ? style : undefined,
  };
}

/**
 * Parse a comma-separated flag string into an array
 */
function parseFlags(value: string): string[] | undefined {
  if (!value) return undefined;
  return value
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
}

/**
 * Parse the story tab CSV into StoryNode[]
 */
export function parseStorySheet(csv: string): StoryNode[] {
  const rows = parseCsv(csv);

  if (rows.length < 2) {
    throw new Error('Story sheet must have a header row and at least one data row');
  }

  // Skip header row (row 0)
  const dataRows = rows.slice(1);
  const nodes: StoryNode[] = [];

  for (const row of dataRows) {
    const nodeId = row[STORY_COLUMNS.nodeId];
    if (!nodeId) continue; // Skip empty rows

    const text = row[STORY_COLUMNS.text] || '';
    if (!text && !row[STORY_COLUMNS.choice1Target]) continue; // Skip rows with no content

    // Parse choices
    const choices: Choice[] = [];
    const choiceConfigs = [
      { text: STORY_COLUMNS.choice1Text, target: STORY_COLUMNS.choice1Target, style: STORY_COLUMNS.choice1Style },
      { text: STORY_COLUMNS.choice2Text, target: STORY_COLUMNS.choice2Target, style: STORY_COLUMNS.choice2Style },
      { text: STORY_COLUMNS.choice3Text, target: STORY_COLUMNS.choice3Target, style: STORY_COLUMNS.choice3Style },
      { text: STORY_COLUMNS.choice4Text, target: STORY_COLUMNS.choice4Target, style: STORY_COLUMNS.choice4Style },
    ];

    for (const config of choiceConfigs) {
      const choice = parseChoice(row, config.text, config.target, config.style);
      if (choice) choices.push(choice);
    }

    // Parse speaker position
    const posValue = (row[STORY_COLUMNS.speakerPosition] || '').toLowerCase();
    const speakerPosition =
      posValue === 'left' || posValue === 'center' || posValue === 'right'
        ? posValue
        : undefined;

    // Parse transition
    const transValue = (row[STORY_COLUMNS.transition] || '').toLowerCase();
    const transition =
      transValue === 'fade' || transValue === 'checkpoint'
        ? transValue
        : transValue === 'cut'
          ? 'cut'
          : undefined;

    const node: StoryNode = {
      nodeId,
      speaker: row[STORY_COLUMNS.speaker] || undefined,
      text,
      speakerPosition,
      speakerImage: row[STORY_COLUMNS.speakerImage] || undefined,
      leftImage: row[STORY_COLUMNS.leftImage] || undefined,
      centerImage: row[STORY_COLUMNS.centerImage] || undefined,
      rightImage: row[STORY_COLUMNS.rightImage] || undefined,
      bgImage: row[STORY_COLUMNS.bgImage] || undefined,
      transition,
      choices,
      music: row[STORY_COLUMNS.music] || undefined,
      soundEffect: row[STORY_COLUMNS.soundEffect] || undefined,
      setFlag: parseFlags(row[STORY_COLUMNS.setFlag] || ''),
      requireFlag: parseFlags(row[STORY_COLUMNS.requireFlag] || ''),
    };

    nodes.push(node);
  }

  return nodes;
}

// ---------------------------------------------------------------------------
// Metadata Sheet Parser
// ---------------------------------------------------------------------------

/**
 * Parse the metadata tab CSV into a Metadata object.
 * The metadata tab has two columns: key (A) and value (B).
 */
export function parseMetadataSheet(csv: string): Metadata {
  const rows = parseCsv(csv);

  // Build a key-value map (skip header if present)
  const kvMap = new Map<string, string>();
  for (const row of rows) {
    const key = (row[0] || '').trim().toLowerCase();
    const value = (row[1] || '').trim();
    if (key && key !== 'key') {
      // Skip the header row if it says "key"
      kvMap.set(key, value);
    }
  }

  // Validate required fields
  const title = kvMap.get('title');
  if (!title) {
    throw new Error('Metadata sheet must include a "title" key');
  }

  const startNode = kvMap.get('start_node') || kvMap.get('startnode');
  if (!startNode) {
    throw new Error('Metadata sheet must include a "start_node" key');
  }

  return {
    title,
    author: kvMap.get('author'),
    description: kvMap.get('description'),
    startNode,
    credits: kvMap.get('credits'),
    about: kvMap.get('about'),
    theme: kvMap.get('theme'),
    version: kvMap.get('version'),
  };
}
