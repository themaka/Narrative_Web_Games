// =============================================================================
// Narrative Web Games Engine — Type Definitions
// =============================================================================

/**
 * Configuration loaded from game.config.json
 */
export interface GameConfig {
  /** URL to the published Google Sheet */
  sheetUrl: string;
  /** Base path for assets — short filenames are resolved relative to this */
  assetBaseUrl?: string;
}

/**
 * Game-level metadata from the "metadata" tab of the Google Sheet
 */
export interface Metadata {
  /** Game title, shown on title screen */
  title: string;
  /** Author name(s) */
  author?: string;
  /** Short description / tagline */
  description?: string;
  /** node_id of the first story node */
  startNode: string;
  /** Credits text (Markdown supported) */
  credits?: string;
  /** About text (Markdown supported) */
  about?: string;
  /** Visual theme override */
  theme?: string;
  /** Game version string */
  version?: string;
}

/**
 * A single story node from the "story" tab of the Google Sheet
 */
export interface StoryNode {
  /** Unique identifier for this node */
  nodeId: string;
  /** Character name displayed as speaker label — blank for narration */
  speaker?: string;
  /** Narrative text / dialogue (Markdown supported) */
  text: string;
  /** Where the active speaker appears */
  speakerPosition?: 'left' | 'center' | 'right';
  /** Portrait image for the active speaker */
  speakerImage?: string;
  /** Image for the left slot (character or prop) */
  leftImage?: string;
  /** Image for the center slot (character or prop) */
  centerImage?: string;
  /** Image for the right slot (character or prop) */
  rightImage?: string;
  /** Background image — blank = keep current */
  bgImage?: string;
  /** Scene transition: cut (default), fade (fade + autosave), checkpoint (autosave only) */
  transition?: 'cut' | 'fade' | 'checkpoint';
  /** Available choices. Empty array = ending node. */
  choices: Choice[];
  /** Background music URL — loops until changed. "stop" = silence. Blank = keep current. */
  music?: string;
  /** One-shot sound effect URL — plays on node load */
  soundEffect?: string;
  /** Flags to set when this node is reached */
  setFlag?: string[];
  /** Flags required for this node (used for conditional choice filtering) */
  requireFlag?: string[];
}

/**
 * A single player choice within a story node
 */
export interface Choice {
  /** Display text for the choice. Blank + target = auto-advance ("Continue" button). */
  text: string;
  /** Target node_id to navigate to */
  target: string;
  /** Visual style for the choice button */
  style?: 'danger' | 'subtle';
}

/**
 * Runtime game state
 */
export interface GameState {
  /** Currently displayed node */
  currentNodeId: string;
  /** Set of boolean flags the player has accumulated */
  flags: Set<string>;
  /** Stack of previously visited node IDs */
  history: string[];
}

/**
 * Serializable save data for localStorage / export
 */
export interface SaveData {
  /** Sheet URL — used as localStorage key to separate saves per game */
  sheetUrl: string;
  /** Node the player was on when saved */
  currentNodeId: string;
  /** Serialized flags (Set<string> → string[]) */
  flags: string[];
  /** Navigation history */
  history: string[];
  /** ISO timestamp of when the save was created */
  savedAt: string;
}

/**
 * Which screen/overlay the app is currently showing
 */
export type AppScreen =
  | 'loading'
  | 'error'
  | 'title'
  | 'game'
  | 'end'
  | 'settings'
  | 'credits'
  | 'about';
