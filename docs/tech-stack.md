# Tech Stack — Narrative Web Games Engine

## Core Stack

| Technology | Choice | Rationale |
|------------|--------|-----------|
| **Language** | TypeScript | Type safety, better DX, catches schema errors at compile time |
| **Framework** | React | Familiar, widely supported, large ecosystem |
| **Build tool** | None for v1 (defer to v2) | Keep it simple — use CDN imports or a minimal setup. See build strategy below. |
| **Markdown rendering** | `marked` or `react-markdown` | Both are mature, well-maintained libraries |
| **Audio** | Howler.js | Most popular web audio library, handles looping/crossfade/format fallbacks |
| **CSS** | CSS Modules or plain CSS | Keep it simple for v1. No CSS-in-JS to avoid build complexity. |

## Build Strategy

### v1 — Vite from day one (confirmed)
- **Vite** as dev server and build tool (minimal config, fast, React+TS out of the box)
- Produces a static `dist/` folder that can be hosted anywhere
- Zero-config for React+TS — avoids painful migration later

### v2 — Enhanced build
- Add build plugins as needed (image optimization, PWA support, etc.)
- Already on Vite, so no migration needed

### v3 — SCORM packaging
- Add SCORM wrapper/packaging step to the build
- See SCORM section below

## Key Libraries

| Library | Purpose | Weekly Downloads | Notes |
|---------|---------|-----------------|-------|
| `react` | UI framework | ~25M | Standard |
| `react-dom` | DOM rendering | ~25M | Standard |
| `typescript` | Type safety | ~50M | Standard |
| `marked` | Markdown → HTML | ~8M | Lightweight, fast. Alternative: `react-markdown` (~2M) |
| `howler` | Audio playback | ~500K | Best web audio lib, handles edge cases (autoplay policy, formats) |
| `vite` | Dev server + build | ~15M | Fast, zero-config for React+TS |

All libraries are mature, widely used, and actively maintained.

## Hosting Strategy

The engine produces **static files** — no server required. End users choose their own hosting:

| Option | Best for | Notes |
|--------|----------|-------|
| **GitHub Pages** | Developers, open-source games | Free, git-based deploy, assets in the same repo |
| **Netlify** | Non-technical authors | Drag-and-drop deploy, free tier |
| **Any static host** | Anyone | Vercel, Cloudflare Pages, S3, etc. |
| **LMS (Canvas, etc.)** | Instructors/educators | Upload as a SCORM package (v3) or embed via iframe |

### Asset Hosting
Game authors need somewhere to host images and audio files. Options:
- **Same GitHub repo** as the game (simplest for developers)
- **Google Drive** (public links — works but URLs can be ugly)
- **Any CDN or file host** — the engine just needs URLs in the sheet columns

## Version Roadmap

### v1 — Core Engine
- React + TypeScript + Vite
- Reads published Google Sheet (story + metadata tabs)
- Renders visual novel UI (characters, backgrounds, dialogue, choices)
- Audio playback (music + sound effects)
- Boolean flag state management
- Markdown rendering
- Credits/About pages
- Static build → host anywhere

### v2 — Enhanced Build & Features
- **Journal tab** — Additional sheet tab for reflection prompts, comprehension questions, or diary entries tied to story nodes. Key for educational use cases, also useful for RPG/therapy narratives.
- Title screen intro animation (frame-based, defined in sheet)
- Build optimizations (code splitting, asset optimization)
- Possibly: PWA support, offline play
- Possibly: More themes, custom CSS support

### v3 — SCORM / LMS Integration
- SCORM 1.2 or 2004 compliant packaging
- Track completion status (student finished the game)
- Record choices made (send to LMS gradebook or as data)
- Package as a single uploadable SCORM zip for Canvas, Moodle, Blackboard, etc.
- Will need a SCORM API wrapper library (e.g., `pipwerks-scorm-api-wrapper` or similar)

## SCORM Notes (v3 — future reference)
- SCORM packages are zip files containing HTML + a manifest (imsmanifest.xml)
- The engine would need to call SCORM API functions: `Initialize`, `SetValue` (for completion, score, interactions), `Commit`, `Terminate`
- Choices could be logged as SCORM "interactions" (cmi.interactions)
- Completion triggers when player reaches an ending node
- This is a build-time packaging step — the runtime engine stays the same, just adds SCORM API calls when running inside an LMS

---

*Created: Feb 13, 2025*
*Status: Finalized for v1. Build tool decision pending user confirmation (Vite recommended).*
