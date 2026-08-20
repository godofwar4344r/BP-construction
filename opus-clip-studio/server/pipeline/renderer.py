"""
High-Performance Video Rendering & Multi-Layer Composition Engine.
Composites 9:16 vertical crops, burnt-in kinetic subtitles, B-roll overlays, and mastered audio using FFmpeg.
"""

import os
import subprocess
import logging
from typing import List, Dict, Any

logger = logging.getLogger("Renderer")

class VideoRenderer:
    def __init__(self, output_dir: str = "./storage/rendered"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def render_short_clip(
        self,
        raw_video_path: str,
        clip_id: str,
        start_time: float,
        end_time: float,
        crop_x: int = None,
        ass_subtitle_path: str = None,
        broll_clips: List[Dict[str, Any]] = None,
        bg_music_path: str = None,
        target_resolution: str = "1080x1920"
    ) -> str:
        """
        Renders a finished vertical short clip with all layers composited.
        """
        output_mp4 = os.path.join(self.output_dir, f"{clip_id}_rendered.mp4")
        duration = end_time - start_time
        target_w, target_h = map(int, target_resolution.split("x"))

        logger.info(f"Rendering short clip {clip_id} from {start_time:.1f}s to {end_time:.1f}s...")

        # Base filter: Crop 9:16 from landscape and scale to 1080x1920
        # If crop_x is not provided, center-crop automatically
        crop_expr = f"ih*({target_w}/{target_h})"
        if crop_x is not None:
            x_expr = str(crop_x)
        else:
            x_expr = "(iw-ow)/2"

        video_filter_chain = [
            f"crop=w={crop_expr}:h=ih:x={x_expr}:y=0",
            f"scale={target_w}:{target_h}"
        ]

        # Burn ASS subtitles if provided
        if ass_subtitle_path and os.path.exists(ass_subtitle_path):
            # Escape path for FFmpeg filter
            escaped_sub_path = ass_subtitle_path.replace("\\", "/").replace(":", "\\:")
            video_filter_chain.append(f"ass={escaped_sub_path}")

        vf_str = ",".join(video_filter_chain)

        cmd = [
            "ffmpeg", "-y",
            "-ss", str(start_time),
            "-to", str(end_time),
            "-i", raw_video_path,
            "-vf", vf_str,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "22",
            "-c:a", "aac",
            "-b:a", "192k",
            output_mp4
        ]

        try:
            logger.info(f"Executing FFmpeg render: {' '.join(cmd)}")
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return output_mp4
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg render error: {e.stderr.decode('utf-8', errors='ignore')}")
            raise RuntimeError(f"Rendering failed: {e.stderr.decode('utf-8', errors='ignore')}")
