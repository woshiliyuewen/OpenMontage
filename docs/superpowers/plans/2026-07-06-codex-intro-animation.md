# Codex Intro Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and render a 40-second local-only Codex introduction animation.

**Architecture:** Reuse the existing `Explainer` Remotion composition by adding one JSON props fixture under `remotion-composer/public/demo-props/`. Render it through the existing `render_demo.py` script into `projects/demos/renders/`.

**Tech Stack:** Python render launcher, Remotion, React scene components, FFmpeg validation.

## Global Constraints

- Duration target: 40 seconds.
- Output resolution: 1920x1080.
- No API keys.
- No external media assets.
- Use existing Remotion components only.
- Output path: `projects/demos/renders/codex-intro.mp4`.

---

### Task 1: Add Codex Intro Remotion Props

**Files:**
- Create: `remotion-composer/public/demo-props/codex-intro.json`

**Interfaces:**
- Consumes: `render_demo.py` demo discovery, which loads every JSON file in `remotion-composer/public/demo-props/`.
- Produces: A valid `Explainer` props object with `cuts`, `overlays`, `captions`, and `audio`.

- [x] **Step 1: Define the scene timeline**

Use six cuts that cover `0` through `40` seconds:

```json
[
  ["codex-open", 0, 5],
  ["codex-context", 5, 12],
  ["codex-loop", 12, 22],
  ["codex-compare", 22, 29],
  ["codex-kpis", 29, 35],
  ["codex-close", 35, 40]
]
```

- [x] **Step 2: Use only existing scene types**

Use `hero_title`, `terminal_scene`, `callout`, `comparison`, and `kpi_grid`; these are already dispatched by `remotion-composer/src/Explainer.tsx`.

- [x] **Step 3: Keep the file local-only**

Do not reference remote images, audio, music, or provider-generated assets.

### Task 2: Render And Validate

**Files:**
- Uses: `render_demo.py`
- Uses: `remotion-composer/public/demo-props/codex-intro.json`
- Produces: `projects/demos/renders/codex-intro.mp4`

**Interfaces:**
- Consumes: `codex-intro.json` from Task 1.
- Produces: A playable MP4 validated by FFmpeg/ffprobe.

- [x] **Step 1: Render the video**

Run:

```powershell
python render_demo.py codex-intro
```

- [x] **Step 2: Validate output metadata**

Run:

```powershell
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 projects\demos\renders\codex-intro.mp4
```

Expected: a duration close to `41` seconds because `Root.tsx` adds one second of final padding.
