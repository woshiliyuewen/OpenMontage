"""Choose stable overlay positions from precomputed face tracks.

The decision is made once per overlay interval, so cards do not jump sides while
they are visible. Left/right are preferred; top/bottom center are fallbacks.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool, Determinism, ExecutionMode, ResourceProfile, ToolResult,
    ToolStability, ToolTier,
)


class OverlayPlacement(BaseTool):
    name = "overlay_placement"
    version = "0.1.0"
    tier = ToolTier.CORE
    capability = "analysis"
    provider = "local_geometry"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.DETERMINISTIC
    dependencies = []
    install_instructions = "No additional dependencies. Requires face_tracker JSON."
    agent_skills = ["ffmpeg"]
    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=128, vram_mb=0, disk_mb=10)
    idempotency_key_fields = ["face_tracking_path", "props_path", "overlap_threshold"]
    side_effects = ["writes overlay placement JSON to output_path"]
    user_visible_verification = ["Review resolved positions against sampled frames"]

    input_schema = {
        "type": "object",
        "required": ["face_tracking_path", "props_path"],
        "properties": {
            "face_tracking_path": {"type": "string"},
            "props_path": {"type": "string"},
            "output_path": {"type": "string"},
            "resolved_props_path": {"type": "string"},
            "overlap_threshold": {"type": "number", "default": 0.08},
        },
    }
    output_schema = {"type": "object", "properties": {"placements": {"type": "array"}}}

    _CANDIDATES = {
        "left_panel": (0.02, 0.08, 0.34, 0.74),
        "right_panel": (0.64, 0.08, 0.34, 0.74),
        "center_top": (0.23, 0.04, 0.54, 0.34),
        "center_bottom": (0.23, 0.49, 0.54, 0.29),
    }

    @staticmethod
    def _overlap_ratio(a: tuple[float, ...], b: tuple[float, ...]) -> float:
        ax, ay, aw, ah = a
        bx, by, bw, bh = b
        width = max(0.0, min(ax + aw, bx + bw) - max(ax, bx))
        height = max(0.0, min(ay + ah, by + bh) - max(ay, by))
        return (width * height) / max(aw * ah, 1e-9)

    @staticmethod
    def _padded_face(bbox: dict[str, float]) -> tuple[float, float, float, float]:
        x = max(0.0, bbox["x"] - 0.08)
        y = max(0.0, bbox["y"] - 0.12)
        right = min(1.0, bbox["x"] + bbox["width"] + 0.08)
        bottom = min(1.0, bbox["y"] + bbox["height"] + 0.18)
        return x, y, right - x, bottom - y

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        tracks_path = Path(inputs["face_tracking_path"])
        props_path = Path(inputs["props_path"])
        if not tracks_path.exists() or not props_path.exists():
            return ToolResult(success=False, error="Face tracking or props file not found")

        tracks = json.loads(tracks_path.read_text(encoding="utf-8"))
        props = json.loads(props_path.read_text(encoding="utf-8"))
        threshold = float(inputs.get("overlap_threshold", 0.08))
        placements: list[dict[str, Any]] = []
        selected_by_id: dict[str, str] = {}

        for overlay in props.get("overlays", []):
            if overlay.get("position") not in {"left_panel", "right_panel"}:
                continue
            start = float(overlay["in_seconds"])
            end = float(overlay["out_seconds"])
            faces = [
                self._padded_face(face["bbox"])
                for face in tracks.get("faces", [])
                if start <= float(face["timestamp_seconds"]) <= end
            ]
            scores = {
                name: max((self._overlap_ratio(rect, face) for face in faces), default=0.0)
                for name, rect in self._CANDIDATES.items()
            }
            preferred = overlay["position"]
            opposite = "right_panel" if preferred == "left_panel" else "left_panel"
            if scores[preferred] <= threshold:
                selected, reason = preferred, "preferred side is face-safe"
            elif scores[opposite] <= threshold:
                selected, reason = opposite, "preferred side occupied; opposite side is safe"
            else:
                centers = ["center_top", "center_bottom"]
                selected = min(centers, key=lambda name: scores[name])
                reason = "both side zones occupied; selected safest center fallback"
            placements.append({
                "overlay_id": overlay.get("id"),
                "preferred": preferred,
                "selected": selected,
                "scores": {key: round(value, 4) for key, value in scores.items()},
                "reason": reason,
                "interval": [start, end],
            })
            if overlay.get("id"):
                selected_by_id[overlay["id"]] = selected

        output_path = Path(inputs.get("output_path", props_path.with_name("overlay_placements.json")))
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps({"version": "1.0", "placements": placements}, indent=2), encoding="utf-8")
        artifacts = [str(output_path)]
        resolved_props_path = inputs.get("resolved_props_path")
        if resolved_props_path:
            resolved = json.loads(json.dumps(props))
            for overlay in resolved.get("overlays", []):
                overlay_id = overlay.get("id")
                if overlay_id in selected_by_id:
                    overlay["position"] = selected_by_id[overlay_id]
                    overlay["placement_mode"] = "face_safe_auto"
            resolved_path = Path(resolved_props_path)
            resolved_path.parent.mkdir(parents=True, exist_ok=True)
            resolved_path.write_text(json.dumps(resolved, ensure_ascii=False, indent=2), encoding="utf-8")
            artifacts.append(str(resolved_path))
        return ToolResult(success=True, data={"output": str(output_path), "resolved_props": resolved_props_path, "placements": placements}, artifacts=artifacts)
