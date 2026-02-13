# Project Scope — Narrative Web Games Engine

## Core Concept
A reusable web-based engine that plays branching narrative games (visual novel / choose-your-own-adventure style). Game content is defined entirely in a Google Sheet — the engine reads the sheet and presents the story to the player.

## Key Properties
- **Data source:** Published Google Sheets (no auth, public read via CSV/JSON export)
- **Content type:** Branching story nodes with dialogue, character art, backgrounds, and audio
- **Reusability:** The engine is game-agnostic. Point it at any correctly formatted sheet and it plays that game.
- **Deployment:** Web-based (runs in a browser, client-side only)

## What the Google Sheet Defines
Full schema detailed in [`docs/sheet-schema.md`](sheet-schema.md).

Two tabs per workbook:
1. **`story` tab** — One row per story node: node ID, speaker, dialogue text, speaker position (left/center/right), character portrait URL, background image URL, up to 4 choices with targets, music, sound effects, and flag set/require for state management.
2. **`metadata` tab** — Key-value pairs: game title, author, description, start node, credits, about text, theme, version.

## Visual Style
The engine renders a **visual novel-style** interface:
- Background image fills the scene
- Three character portrait slots: **left, center, right**
- Dialogue box at the bottom with speaker name, narrative text, and choice buttons
- See wireframe in `docs/sheet-schema.md` for layout reference

## Game Features
- **Branching narrative** — Players make choices that lead to different story paths
- **Audio** — Background music (looping, persists across nodes) and one-shot sound effects
- **Visual novel layout** — Character portraits positioned left/center/right with backgrounds
- **Simple state management** — Boolean flags (set/require) for conditional choice visibility
- **Credits & About pages** — Accessible via in-game button, content defined in metadata tab
- **No auth required** — Uses publicly published Google Sheet URLs

## What the Engine Does
- Fetches and parses the published Google Sheet (both story and metadata tabs)
- Validates the sheet structure
- Renders a title screen from metadata
- Renders the current story node (background, characters, dialogue, choices)
- Manages audio playback (music looping, sound effects)
- Tracks player state (current node, history, flags)
- Filters choices based on flag requirements
- Provides Credits and About pages
- Navigates between nodes based on player choices

## Out of Scope (for now)
- Google auth / private sheets
- Multiplayer
- A sheet editor or creation tool (authors use Google Sheets directly)
- Server-side logic (this is a client-side app)
- Numeric variables / full inventory system (flags only for now)

## v2 Feature Ideas
- **Journal tab** — A separate sheet tab where authors define reflection prompts, journal entries, or comprehension questions tied to specific nodes. Primary use case is education (students reflect on choices), but also useful for RPGs (character diary), therapy-based narratives, etc. Spotted in the Mark Stone reference game.
- Title screen intro animation (the reference game had an "Introframes" tab for cheap animation)
- Save/load enhancements (multiple save slots, manual save)
- PWA / offline support
- Custom CSS themes per game

## v3+ Feature Ideas
- **Password/access controls** — Restrict access to a game (e.g., instructor sets a password students need to enter before playing). Useful for LMS contexts where the game shouldn't be publicly accessible.
- SCORM / LMS integration (see `docs/tech-stack.md`)

---

*Created: Feb 13, 2025*
*Updated: Feb 13, 2025 — Finalized schema decisions, visual layout, state management approach, credits/about pages*
