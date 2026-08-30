# Codex Intro Animation Design

## Goal

Create a 40-second local-only introduction animation for Codex that explains it as an AI teammate for software work.

## Audience

Developers, founders, and technical operators who understand code workflows but may not yet know how Codex fits into day-to-day engineering.

## Creative Direction

Use a dark developer-workbench visual style with terminal motion, product-positioning cards, KPI cards, and short captions. The video should feel like a practical software tool demo, not a generic AI promo.

## Runtime

Use OpenMontage's existing `Explainer` Remotion composition with checked-in scene types. Do not call paid APIs, generate cloud images, or require API keys.

## Structure

1. `0-5s`: Introduce Codex as an AI teammate inside the workspace.
2. `5-12s`: Show Codex reading the repo, understanding context, and planning changes.
3. `12-22s`: Show the execution loop: edit code, run tests, inspect failures, patch again.
4. `22-31s`: Show the collaboration model: user sets the goal, Codex handles implementation and verification.
5. `31-40s`: Close with the outcome: less handoff friction, more shipped code.

## Copy

Keep on-screen copy concise and English-first:

- "Codex"
- "An AI teammate inside your workspace"
- "Reads the repo. Edits files. Runs commands. Verifies the result."
- "You set the goal. Codex handles the loop."
- "Ship code with an AI teammate."

## Constraints

- Duration target: 40 seconds.
- Output resolution: 1920x1080.
- No API keys.
- No external media assets.
- Use existing Remotion components only.
- Output path: `projects/demos/renders/codex-intro.mp4`.

## Validation

- Render succeeds with `python render_demo.py codex-intro`.
- `ffprobe` reports a playable MP4.
- Duration is approximately 40 seconds plus the existing one-second Remotion padding.
