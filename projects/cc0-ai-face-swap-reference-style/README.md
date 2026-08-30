# AI Face Swap Editorial Case Study

This directory contains the six published cuts and the production record for a
45-second talking-head restyle. The final revision removes full-frame translucent
shading and the unintended outer card plate, then places information cards with
face-aware left/right selection and a center fallback.

## Deliverables

- `export/ai-face-swap-editorial-master-1080p.mp4` — initial reference-style master.
- `export/ai-face-swap-editorial-v2-1080p.mp4` — timing and presentation fixes.
- `export/ai-face-swap-editorial-v3-1080p.mp4` — source-visible editorial overlays.
- `export/ai-face-swap-editorial-v4-1080p.mp4` — readability and hierarchy pass.
- `export/ai-face-swap-editorial-v5-1080p.mp4` — transparent wrapper removal.
- `export/ai-face-swap-editorial-v6-auto-placement-1080p.mp4` — face-safe automatic placement; current recommended cut.

The MP4, source clip, and WAV files are stored with Git LFS. Intermediate 60 fps
renders, debug renders, QA frame dumps, and local history snapshots are intentionally
excluded because they are regenerable and add more than 350 MB of duplicate media.

## Pipeline

- Production model: hybrid, source-led talking head plus evidence-driven motion graphics.
- Composition: Remotion/React at 60 fps for frame-accurate typography, subtitles,
  evidence cards, and transitions.
- Placement analysis: OpenCV Haar face tracking followed by interval-level scoring
  of left, right, top-center, and bottom-center candidate regions.
- Placement policy: preferred side, then opposite safe side, then the safer center
  fallback. One placement is held for the full overlay interval to avoid jitter.
- Finishing: FFmpeg transcode to 1920x1080, 30 fps, H.264/AAC, yuv420p.
- Audio: original speech plus four locally generated transition cues; no music.
- External API usage: none. Estimated API cost: USD 0.

## Skills and tools used

- OpenMontage `create-video` workflow for project stages, artifacts, checkpoints,
  event logging, and delivery structure.
- `video-understand` for visual/content review and `motion-graphics` for the editorial system.
- `remotion` and `remotion-best-practices` for the React composition and render path.
- `ffmpeg` / FFprobe for finishing, codec normalization, probing, and audio checks.
- Local Python/OpenCV utilities for face tracking and overlay placement.
- Codex for reference decomposition, pipeline selection, scene and overlay design,
  implementation, iterative critique, revision decisions, automated placement logic,
  rendering orchestration, and final QA.

## Production record

- `artifacts/decision_log.json` records considered alternatives and selected decisions.
- `artifacts/edit_decisions.json` records the final timeline, layers, subtitle policy,
  sound cues, and render strategy.
- `artifacts/face_tracking.json` and `artifacts/overlay_placements.json` contain the
  measurements behind automatic card placement.
- `artifacts/final_review_v*.json` and `artifacts/render_report_v*.json` record the
  technical checks for each revision.
- `checkpoint_*.json`, `events.jsonl`, and `project.json` preserve stage state and provenance.
- `assets/composition-props-auto.json`, `assets/subtitles.json`, and the source media
  are the principal reproducibility inputs.

The shared implementation used by this case study lives in
`remotion-composer/src/TalkingHead.tsx`, `tools/analysis/overlay_placement.py`, and
`tools/video/video_compose.py` at the repository root.

## Current QA result

V6 passed the recorded technical review: 45.376 seconds, 1920x1080, 30 fps,
H.264/AAC, no detected face or subtitle overlap, no audio clipping, and stable
placement throughout each overlay interval. See `artifacts/final_review_v6.json`
for the machine-readable result.
