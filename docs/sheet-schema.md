# Google Sheet Schema — Narrative Web Games Engine

## Overview
Each Google Sheet workbook contains multiple tabs:
- **`story`** tab — the main content (one row per story node)
- **`metadata`** tab — game-level configuration (title, author, credits, settings)

---

## Tab 1: `story`

Each row represents a single story node. The schema is **26 columns (A–Z)**.

### Core Columns

| Column | Name | Required | Description |
|--------|------|----------|-------------|
| A | `node_id` | Yes | Unique string identifier for this story node. Use descriptive naming conventions (e.g., `Intro1`, `Intro2`, `CaveEntrance1`). See naming rules below. |
| B | `speaker` | No | Name of the character speaking (displayed as a name tag/label). Blank for narration. |
| C | `text` | Yes | The narrative text or dialogue. **Supports Markdown** for formatting (bold, italic, line breaks, etc.) |
| D | `speaker_position` | No | Where the active speaker appears: `left`, `center`, `right`. Default: `center` |
| E | `speaker_image` | No | URL or filename for character portrait/sprite of the active speaker |

### Additional Visible Characters / Props

These columns control what's visible in the three on-screen slots alongside (or instead of) the active speaker. Can be characters OR props (items, objects, scenery pieces).

| Column | Name | Required | Description |
|--------|------|----------|-------------|
| F | `left_image` | No | Image for the **left** slot (character or prop). Overridden by `speaker_image` if speaker is also left. |
| G | `center_image` | No | Image for the **center** slot (character or prop). Overridden by `speaker_image` if speaker is also center. |
| H | `right_image` | No | Image for the **right** slot (character or prop). Overridden by `speaker_image` if speaker is also right. |

### Scene

| Column | Name | Required | Description |
|--------|------|----------|-------------|
| I | `bg_image` | No | URL/filename for background image. Blank = keep current background. |
| J | `transition` | No | Scene transition + save behavior: `cut` (default), `fade` (fade + autosave), `checkpoint` (no fade, autosave). See behavior rules. |

### Choices / Navigation

`choice_1_target` serves double duty: if `choice_1_text` is blank, the engine treats it as an **auto-advance** and shows a "Continue" button. If text is present, it's a real player choice.

| Column | Name | Required | Description |
|--------|------|----------|-------------|
| K | `choice_1_text` | No | Text for choice 1. **If blank but `choice_1_target` is set → auto-advance (Continue button).** |
| L | `choice_1_target` | No | `node_id` to navigate to. Acts as the default "next node" when no choice text is provided. |
| M | `choice_1_style` | No | Optional style: `danger`, `subtle`, or blank (default) |
| N | `choice_2_text` | No | Text for choice 2 |
| O | `choice_2_target` | No | `node_id` to navigate to when choice 2 is selected |
| P | `choice_2_style` | No | Optional style for choice 2 |
| Q | `choice_3_text` | No | Text for choice 3 |
| R | `choice_3_target` | No | `node_id` to navigate to when choice 3 is selected |
| S | `choice_3_style` | No | Optional style for choice 3 |
| T | `choice_4_text` | No | Text for choice 4 |
| U | `choice_4_target` | No | `node_id` to navigate to when choice 4 is selected |
| V | `choice_4_style` | No | Optional style for choice 4 |

### Audio

| Column | Name | Required | Description |
|--------|------|----------|-------------|
| W | `music` | No | URL/filename for background music. Loops until changed. Blank = keep current. `stop` = silence. |
| X | `sound_effect` | No | URL/filename for a one-shot sound effect played when this node loads |

### State

| Column | Name | Required | Description |
|--------|------|----------|-------------|
| Y | `set_flag` | No | Flag(s) to set when this node is reached (comma-separated, e.g., `has_key, met_wizard`) |
| Z | `require_flag` | No | Flag(s) required — used for conditional choice filtering |

**Total: 26 columns (A–Z)**

---

## Node ID Naming Convention

Node IDs are **strings**, not sequential numbers. This is critical for maintainability:

- Use **descriptive chapter/section prefixes**: `Intro1`, `Intro2`, `CaveEntrance1`, `CaveEntrance2`
- **Inserting scenes** is easy: add `Intro2b` or `Intro2_5` between `Intro2` and `Intro3` — no renumbering needed
- **Chapter markers** can use unprefixed names: `SaturdayMornings`, `CallDavid`, `TheFuture`
- IDs must be **unique** across the entire story tab
- Engine does not care about format — only uniqueness matters
- Avoid spaces; use camelCase or underscores

### Example ID structure from a real game:
```
Intro1, Intro2, Intro3, ... Intro11
SaturdayMornings          ← chapter marker
SM1, SM2, SM3, ... SM20   ← scenes within chapter
TalkToMom                 ← chapter marker
TTM1, TTM2, ... TTM13     ← scenes within chapter
CallDavid                 ← branch entry point
CD1, CD2, ... CD15
```

---

## Tab 2: `metadata`

Key-value pairs for game-level settings. Each row is a setting.

| Column | Name | Description |
|--------|------|-------------|
| A | `key` | Setting name |
| B | `value` | Setting value |

### Expected keys:

| Key | Required | Description | Example |
|-----|----------|-------------|---------|
| `title` | Yes | Game title, shown in header/title screen | `The Lost Temple` |
| `author` | No | Author name(s) | `Jane Doe` |
| `description` | No | Short description / tagline | `A mystery adventure in an ancient ruin` |
| `start_node` | Yes | `node_id` of the first story node | `Intro1` |
| `credits` | No | Credits text (Markdown supported, shown on Credits page) | `**Writing:** Jane\n**Art:** John` |
| `about` | No | About text (Markdown supported, shown on About page) | `This game was made for...` |
| `theme` | No | Visual theme override | `dark`, `light`, `fantasy` |
| `version` | No | Game version | `1.0` |

---

## Visual Layout

Based on the reference mockup, the game screen has this structure:

```
┌─────────────────────────────────────────────┐
│              [Background Image]              │
│                                              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   │
│  │  LEFT   │   │ CENTER  │   │  RIGHT  │   │
│  │  char   │   │char/prop│   │  char   │   │
│  │  slot   │   │  slot   │   │  slot   │   │
│  └─────────┘   └─────────┘   └─────────┘   │
│                                              │
│  ┌───────────────────────────────────────┐   │
│  │  Speaker Name                         │   │
│  │  "Dialogue text goes here..."         │   │
│  │                                       │   │
│  │  [Choice 1]  [Choice 2]  [Choice 3]  │   │
│  │         — or [Continue] —             │   │
│  └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

- **Three visual slots** (left, center, right) for character portraits, sprites, or props
- **Active speaker** is placed via `speaker_position` + `speaker_image`
- **Additional characters/props** can fill the other slots via `left_image`, `center_image`, `right_image`
- **Dialogue box** at the bottom with speaker name, narrative text (Markdown rendered), and choice buttons OR a Continue button
- **Background image** fills the scene area behind characters

### Multi-Character Example

A scene where the player must choose between two arguing characters:

| node_id | speaker | text | speaker_position | speaker_image | left_image | center_image | right_image | ... | choice_1_text | choice_1_target |
|---------|---------|------|------------------|---------------|------------|--------------|-------------|-----|---------------|-----------------|
| `Argue1` | Narrator | *Two figures block your path.* | center | | `warrior.png` | | `mage.png` | | | `Argue2` |
| `Argue2` | Warrior | **Come with me.** The dungeon is no place for magic. | left | `warrior.png` | | | `mage.png` | | | `Argue3` |
| `Argue3` | Mage | *Fool.* Without my spells, you'll never survive. | right | `mage.png` | `warrior.png` | | | | *(has choices)* | |

(Argue3 would have choices defined to branch the story)

### Auto-Advance Example (from the real Mark Stone game)

Most nodes simply advance to the next one — no player choice needed:

| node_id | speaker | text | ... | choice_1_text | choice_1_target |
|---------|---------|------|-----|---------------|-----------------|
| `SM1` | | You are 7 years old. | ... | | `SM2` |
| `SM2` | | Usually, on Saturday mornings, your mom makes blueberry pancakes... | ... | | `SM3` |
| `SM3` | | This morning, you wake up to your older brother and dad yelling. | ... | | `SM4` |
| `SM4` | Dad | Get out! You're 18 now. You're no longer my problem! | ... | | `SM5` |

Note: `choice_1_target` is filled but `choice_1_text` is blank → engine shows "Continue".

The engine renders a **"Continue"** button (or click-to-advance) for these nodes.

---

## Behavior Rules

### Node Navigation Priority
1. If **any choice has both text AND target** → show choice buttons (branching node)
2. If **`choice_1_target` is set but `choice_1_text` is blank** (and no other choices have text) → show a "Continue" button (auto-advance)
3. If **no targets at all** → it's an **ending node** — show "The End" + Restart

### Text Formatting
- `text` column supports **Markdown** (rendered to HTML by the engine)
- Supports: bold, italic, line breaks, horizontal rules
- Authors can use Markdown for emphasis, scene descriptions in italics, shouted dialogue in bold, etc.
- `credits` and `about` metadata values also support Markdown

### Choices
- Max 4 choices per node (typically 2-3 in practice)
- Choices with a `require_flag` on their **target node** are only shown if the player has that flag
- If all choices are filtered out by flags, fall back to `next_node` if present, otherwise treat as ending

### Choice Styles
- `choice_X_style` applies a visual style to the choice button
- Supported styles (initial set — can be extended):
  - *(blank)* — default button style
  - `danger` — red/warning style, for threatening or risky choices
  - `subtle` — muted/faded, for less obvious or hidden-path choices
- Styles are purely visual — they don't affect game logic

### Transitions & Save Points
- `transition` controls both scene transitions and autosave behavior
- `cut` (default) — instant scene change, no animation, no save
- `fade` — fade to black and back **+ autosave**. Use for chapter breaks or dramatic shifts.
- `checkpoint` — no visual transition (instant cut), but **triggers autosave**. Use for mid-chapter save points in long sections.
- If blank, defaults to `cut`

### Save System
- **Autosave** triggers on `fade` and `checkpoint` nodes
- Save data is stored in **browser localStorage** (keyed by sheet URL so multiple games don't collide)
- Saved state includes: current node ID, all flags, navigation history
- On game load, if a save exists, the TitleScreen shows a **"Continue"** button alongside "Start" (new game)
- **Export/Import** — Settings panel includes options to export save data as a JSON file and import a previously exported save. This allows players to transfer progress between browsers/devices.
- Manual save is not supported for v1 — only autosave at checkpoints

### Audio
- `music` — Starts looping when specified. Continues across nodes until a new `music` value is set. Set to `stop` to silence.
- `sound_effect` — Plays once on node load. No carryover.
- Both accept URLs or short filenames (resolved via `assetBaseUrl` in config)

### Images
- `speaker_image` — Displayed in the character slot indicated by `speaker_position`. This is the "active" character.
- `left_image`, `center_image`, `right_image` — Additional characters or **props** visible in the scene. If a slot is also used by `speaker_position`, the `speaker_image` takes priority for that slot.
- The center slot is commonly used for **props** (items, objects, scene elements) in addition to characters.
- Images persist: if blank, the previous node's images in those slots remain visible. Use `clear` or `none` to explicitly remove a character/prop from a slot.
- `bg_image` — Fills the background area. Persists across nodes until changed. Use `clear` or `none` to remove.

### State / Flags
- `set_flag` — When the player reaches this node, the listed flags are added to their state. Comma-separated for multiple flags.
- `require_flag` — Used for conditional branching. If a choice's target node has a `require_flag`, that choice is only visible if the player has the flag.
- Flags are simple booleans (you have it or you don't). No numeric variables for now.
- This is a lightweight system — covers "picked up key" / "met the wizard" scenarios without full inventory management.

---

## Validated Against Real Content

This schema was validated against an existing ~300-node visual novel game (Mark Stone). Key findings incorporated:
- **Auto-advance nodes** are the most common type (~90% of nodes) — `next_node` column handles this cleanly
- **Props** (pills, bags, photos, etc.) use the center slot alongside characters — no separate column needed
- **String-based node IDs** with chapter prefixes make editing and inserting scenes far easier than sequential numbers
- **Speaker position** maps cleanly to the existing left/right character placement
- **Background persistence** matches existing behavior (set once, stays until changed)
- **Sound effects** use short filenames resolved via asset base URL

---

## Resolved Design Decisions

| Question | Decision | Rationale |
|----------|----------|-----------|
| Text formatting | Markdown | Flexible enough for emphasis and formatting, easy for authors in Google Sheets |
| Multiple characters per node | Supported via `left_image`/`center_image`/`right_image` | Enables group scenes, arguments, etc. Most nodes will use only the active speaker |
| Transitions + saves | `transition` column: `cut` (default), `fade` (fade + autosave), `checkpoint` (autosave, no fade) | Keeps save logic in existing column, no extra columns needed |
| Save system | localStorage + export/import JSON | Autosave at fade/checkpoint nodes. Continue button on title screen. Export for portability. |
| Choice styling | `choice_X_style` column with named styles | Enables visual hints (danger, subtle) without affecting logic |
| Max choices | 4 | Sufficient; 2-3 will be typical |
| Auto-advance | `choice_1_target` without `choice_1_text` | Most nodes (~90%) don't branch. Target with no text = "Continue" button. Keeps schema at 26 columns. |
| Node IDs | String-based with chapter prefixes | Allows inserting scenes without renumbering. E.g., `Intro1`, `Intro2`, `Intro2b`, `Intro3` |
| Props | Use `center_image` (or any slot) | No dedicated prop column needed — slots accept characters or props interchangeably |

---

*Created: Feb 13, 2025*
*Updated: Feb 13, 2025 — Validated against real game data. Auto-advance via choice_1_target (no text). String IDs, prop documentation. Schema is 26 columns (A–Z).*
