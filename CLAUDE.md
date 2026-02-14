# Narrative Web Games — Project Context

## Project-Specific Instructions
- Any planning discussion longer than a few minutes should produce a file in `docs/`.
- This file tracks high-level status. Detailed designs go in `docs/`.
- When we finalize a tech stack, architecture, or game concept — write it here immediately.
- **Always test before committing.** Run the dev server, verify the feature works, and get user confirmation before `git commit`.

---

## Project Goals
- **Reusable narrative game engine** (not a single game — a platform)
- Web-based app that reads **branching story nodes** (choose-your-own-adventure style) from a **published Google Sheet**
- No Google auth required — uses publicly published sheet URL
- Anyone can create a game by making a properly formatted Google Sheet and pointing the engine at it

## Tech Stack
- **React + TypeScript** — core framework
- **Vite** — dev server + build (included from v1)
- **marked** or **react-markdown** — Markdown rendering
- **Howler.js** — audio playback (looping, sound effects, autoplay handling)
- **CSS Modules or plain CSS** — styling (no CSS-in-JS for v1)
- **Static output** — no server, host anywhere (GitHub Pages, Netlify, LMS, etc.)
- Full details: [`docs/tech-stack.md`](docs/tech-stack.md)

## Architecture Decisions
- **Config-driven:** Each deployment has a `game.config.json` with sheet URL + optional asset base URL
- **Asset URL resolution:** Supports both full URLs and short filenames (prepends assetBaseUrl if not http)
- **Query param override:** `?sheet=URL` for dev/testing
- Full details: [`docs/architecture.md`](docs/architecture.md)

## Current Status
- **Session 3 (Feb 14, 2025):** Core engine implementation
  - Scaffolded Vite + React + TypeScript project, pushed to GitHub
  - Google Sheets integration: tab discovery, URL normalization, CSV fetch, flexible metadata parsing
  - Created sample game "The Winding Path" (28 nodes exercising all schema features)
  - Image persistence: character/prop slots persist within scenes, auto-clear on scene change
  - Fade transitions (#3 ✅): timeout-driven FadeOverlay, full fade-out → black → fade-in sequence
  - Choice filtering by require_flag (#2 ✅): choices hidden when player lacks target node's required flags
  - **Remaining issues:** #4 image preloading, #5 persistence polish, #6 audio, #7 save/load, #8 responsive
- **Session 2 (Feb 13, 2025):** Re-scoped project from scratch after session 1 was lost
  - Defined sheet schema, scope, tech stack, architecture, version roadmap
  - All design docs in `docs/`
  - Validated schema against real ~300-node game (Mark Stone)

## Key Design Docs
- [`docs/scope.md`](docs/scope.md) — Project scope and features
- [`docs/sheet-schema.md`](docs/sheet-schema.md) — Google Sheet column schema and behavior rules
- [`docs/tech-stack.md`](docs/tech-stack.md) — Tech stack, libraries, hosting strategy, version roadmap
- [`docs/architecture.md`](docs/architecture.md) — Component tree, data flow, types, file structure

## Resolved Design Decisions
- **Text formatting:** Markdown (in dialogue, credits, about)
- **Multiple characters:** Supported — `left_image`/`center_image`/`right_image` columns alongside active speaker
- **Transitions:** `transition` column — `cut` (default) or `fade` (for chapter breaks)
- **Choice styling:** `choice_X_style` column — `danger` (red), `subtle` (muted), blank = normal
- **Schema is 26 columns (A–Z)** — fully spec'd in `docs/sheet-schema.md`
- **Auto-advance:** `choice_1_target` with no `choice_1_text` = "Continue" button. No targets at all = ending node.
- **String node IDs:** Chapter prefixes like `Intro1`, `SM1`, `CD5` — allows inserting scenes without renumbering
- **Props:** Center slot (`center_image`) handles both characters and props (items, objects)

## Open Questions
- ~~Architecture (component structure, data flow)~~ **Resolved — Context + useReducer, CSV fetch, preload next nodes, CSS transitions**
- ~~Save/load via localStorage (v2)~~ **Moved to v1 — autosave on fade/checkpoint nodes, localStorage + export/import JSON**
- ~~Confirm: Use Vite from v1?~~ **Yes — confirmed**
- No open questions remain — ready for implementation
