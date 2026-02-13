# Architecture — Narrative Web Games Engine

## Game Loading & Configuration

### Config File (`game.config.json`)
Each deployment includes a config file that tells the engine where to find the game data:

```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/e/XXXX/pub",
  "assetBaseUrl": "https://raw.githubusercontent.com/author/game-assets/main/"
}
```

- `sheetUrl` — URL to the published Google Sheet (required)
- `assetBaseUrl` — Base path for assets (optional). If provided, short filenames in the sheet are resolved relative to this.

### Asset URL Resolution
The engine supports both full URLs and short filenames:
- If a value starts with `http://` or `https://`, use it as-is
- Otherwise, prepend `assetBaseUrl` from config
- Example: `warrior.png` → `https://raw.githubusercontent.com/author/game-assets/main/warrior.png`
- Example: `https://example.com/custom/warrior.png` → used as-is

### Query Parameter Override (for development)
`?sheet=SHEET_URL` overrides the config file — useful for testing different sheets without redeploying.

---

## React Component Tree

```
App
├── LoadingScreen              — Shown while fetching/parsing sheet, with status messages
│                                ("Loading datasheet...", "Loading assets...", etc.)
├── ErrorScreen                — Shown if sheet URL is bad or schema is invalid
├── TitleScreen                — Game title, author, description, "Start" + "Continue" (if save exists)
├── GameStage                  — Main game container (visible during gameplay)
│   ├── BackgroundLayer        — Full-bleed background image, handles persistence + fade transitions
│   ├── CharacterLayer         — Contains the 3 character slots
│   │   ├── CharacterSlot      — Individual character portrait (x3: left, center, right)
│   │   └── (empty/populated based on current node data)
│   ├── DialogueBox            — Bottom panel for narrative content
│   │   ├── SpeakerName        — Character name label
│   │   ├── DialogueText       — Markdown-rendered narrative text
│   │   └── ChoiceList         — Container for choice buttons
│   │       └── ChoiceButton   — Individual choice (x1-4, styled per choice_X_style)
│   └── ControlBar             — Settings/controls overlay
│       ├── SettingsButton     — Opens settings panel
│       ├── CreditsButton      — Opens credits page
│       └── AboutButton        — Opens about page
├── SettingsPanel              — Overlay panel for game settings:
│   ├── Music volume slider
│   ├── SFX volume slider
│   ├── Mute toggle
│   ├── Export Save — download save data as JSON file
│   ├── Import Save — upload a previously exported save JSON
│   └── "Load Other Game" — URL input to load a different Google Sheet
├── CreditsPage                — Full-screen overlay with credits (Markdown rendered)
├── AboutPage                  — Full-screen overlay with about info (Markdown rendered)
└── EndScreen                  — "The End" screen with restart option + credits link
```

### Component Responsibilities

| Component | Purpose |
|-----------|---------|
| **App** | Top-level: loads config, fetches sheet, manages which screen is shown |
| **LoadingScreen** | Spinner with contextual status messages: "Loading datasheet...", "Parsing story data...", "Loading assets...". Gives the player feedback about what's happening. |
| **ErrorScreen** | Displays error message if sheet can't be loaded or has schema issues |
| **TitleScreen** | Shows game title, author, description from metadata tab. "Start" button begins new game. If a save exists in localStorage, also shows "Continue" to resume from last checkpoint. |
| **GameStage** | Main gameplay container. Receives current node data and renders the scene. |
| **BackgroundLayer** | Renders `bg_image`. Persists across nodes. Handles `fade` transition (fade to black and back). |
| **CharacterLayer** | Layout container for the 3 character slots (flexbox: left/center/right) |
| **CharacterSlot** | Renders a single character portrait image. Handles show/hide/persist logic. |
| **DialogueBox** | Bottom panel containing speaker name, text, and choices |
| **SpeakerName** | Displays the `speaker` value as a styled label |
| **DialogueText** | Renders `text` column through Markdown parser |
| **ChoiceList** | Maps available choices (filtered by flags) into ChoiceButton components |
| **ChoiceButton** | A single clickable choice. Styled based on `choice_X_style`. Triggers navigation to target node. |
| **ControlBar** | Persistent small bar/overlay with buttons for settings, credits, about |
| **SettingsPanel** | Overlay panel with: music volume, SFX volume, mute toggle, export/import save, and "Load Other Game" (URL input to switch sheets at runtime) |
| **CreditsPage** | Full overlay rendering `credits` metadata value as Markdown |
| **AboutPage** | Full overlay rendering `about` metadata value as Markdown |
| **EndScreen** | Shown when a node has no choices. "The End", restart button, credits link. |

### Non-Visual Pieces (Hooks / Services)

| Name | Type | Purpose |
|------|------|---------|
| **useGameState** | Hook | Manages current node ID, flag set, navigation history |
| **useSheetData** | Hook | Fetches and parses the Google Sheet, returns typed story nodes + metadata |
| **useAudio** | Hook | Manages Howler.js instances — current music track (loop), sound effects (one-shot) |
| **useAssetUrl** | Hook | Resolves asset URLs (short name vs full URL based on config) |
| **useSaveData** | Hook | Manages autosave (on fade/checkpoint nodes), load from localStorage, export/import as JSON. Keyed by sheet URL. |
| **sheetParser** | Utility | Parses CSV/JSON from Google Sheets API into typed StoryNode[] and Metadata |
| **markdownRenderer** | Utility | Wraps `marked` or `react-markdown` with consistent config |

---

## Data Flow

```
1. App loads → show LoadingScreen
2. LoadingScreen: "Loading datasheet..."
   - Fetch game.config.json → get sheetUrl + assetBaseUrl
   - Check for ?sheet= query param override
3. LoadingScreen: "Parsing story data..."
   - Fetch published Google Sheet (both tabs)
   - Parse into: StoryNode[] + Metadata
   - Validate schema
4. LoadingScreen: "Loading assets..."
   - (Optional) Preload key images referenced in early nodes
5. Check localStorage for existing save data (keyed by sheet URL)
6. Show TitleScreen (from Metadata)
   - Always show "Start" (new game)
   - If save data exists, also show "Continue"
7. User clicks "Start" or "Continue"
   - Start → navigate to start_node with fresh state
   - Continue → restore saved state (node ID, flags, history)
8. Game loop:
   a. Look up current node from StoryNode[]
   b. Render BackgroundLayer, CharacterSlots, DialogueBox
   c. Filter choices (check require_flag against player's flags)
   d. Play/change music if specified
   e. Play sound effect if specified
   f. Set flags if specified
   g. If node transition is `fade` or `checkpoint` → autosave to localStorage
   h. Player clicks a choice → update current node → repeat from (a)
   i. If no choices → show EndScreen

Alternative entry: "Load Other Game" from SettingsPanel
   - User enters a new sheet URL
   - Return to step 1 (reset all game state, show LoadingScreen)
```

---

## TypeScript Types (preliminary)

```typescript
interface GameConfig {
  sheetUrl: string;
  assetBaseUrl?: string;
}

interface Metadata {
  title: string;
  author?: string;
  description?: string;
  startNode: string;
  credits?: string;   // Markdown
  about?: string;     // Markdown
  theme?: string;
  version?: string;
}

interface StoryNode {
  nodeId: string;
  speaker?: string;
  text: string;       // Markdown
  speakerPosition?: 'left' | 'center' | 'right';
  speakerImage?: string;
  leftImage?: string;
  centerImage?: string;  // also used for props
  rightImage?: string;
  bgImage?: string;
  transition?: 'cut' | 'fade' | 'checkpoint';
  choices: Choice[];     // if first choice has target but no text → auto-advance. Empty array → ending node.
  music?: string;
  soundEffect?: string;
  setFlag?: string[];
  requireFlag?: string[];
}

interface Choice {
  text: string;
  target: string;     // node_id
  style?: 'danger' | 'subtle';
}

interface GameState {
  currentNodeId: string;
  flags: Set<string>;
  history: string[];   // stack of previous node IDs
}

interface SaveData {
  sheetUrl: string;      // key for localStorage — identifies which game
  currentNodeId: string;
  flags: string[];       // serialized from Set<string>
  history: string[];
  savedAt: string;       // ISO timestamp
}
```

---

## File Structure (preliminary)

```
src/
├── App.tsx
├── main.tsx                    — Vite entry point
├── game.config.json            — Sheet URL + asset base URL
├── types/
│   └── index.ts                — GameConfig, Metadata, StoryNode, Choice, GameState
├── hooks/
│   ├── useGameState.ts
│   ├── useSheetData.ts
│   ├── useAudio.ts
│   ├── useAssetUrl.ts
│   └── useSaveData.ts
├── utils/
│   ├── sheetParser.ts          — Google Sheet → typed data
│   └── markdownRenderer.ts     — Markdown config wrapper
├── components/
│   ├── LoadingScreen.tsx
│   ├── ErrorScreen.tsx
│   ├── TitleScreen.tsx
│   ├── EndScreen.tsx
│   ├── GameStage/
│   │   ├── GameStage.tsx
│   │   ├── BackgroundLayer.tsx
│   │   ├── CharacterLayer.tsx
│   │   ├── CharacterSlot.tsx
│   │   ├── DialogueBox.tsx
│   │   ├── SpeakerName.tsx
│   │   ├── DialogueText.tsx
│   │   ├── ChoiceList.tsx
│   │   └── ChoiceButton.tsx
│   ├── ControlBar/
│   │   └── ControlBar.tsx
│   ├── SettingsPanel.tsx
│   ├── CreditsPage.tsx
│   └── AboutPage.tsx
└── styles/
    ├── global.css
    └── (component CSS modules as needed)
```

---

## Resolved Architecture Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| State management | React Context + useReducer | State is simple: current node, flags (Set), history (array). No need for Redux or Zustand. |
| Google Sheets fetch | CSV export per tab | URL format: `?gid=SHEET_ID&single=true&output=csv`. Simpler to parse than Google's JSON format. Confirmed working with real published sheet. |
| Image preloading | Preload next few nodes | On each node render, preload images for the upcoming 2-3 reachable nodes in the background. Balances fast start with smooth scene changes. |
| Fade transitions | Plain CSS transitions | CSS `opacity` transitions are sufficient for fade-to-black. Zero dependencies. Easy to swap in Framer Motion later if complex animations are needed (component-level change only, not architectural). |

---

*Created: Feb 13, 2025*
*Updated: Feb 13, 2025 — All architecture questions resolved. Ready for implementation.*
