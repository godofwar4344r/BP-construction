"""
Video Ingestion & Stream Extraction Module for OpusClip Engine.
Handles downloading YouTube / Vimeo / Direct URLs via yt-dlp, 
saving uploaded video files, and extracting 16kHz mono audio & 360p visual proxies.
"""

import os
import subprocess
import json
import logging
from typing import Dict, Any, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Ingestion")

class VideoIngester:
    def __init__(self, output_dir: str = "./storage/media"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def download_url(self, url: str, video_id: str) -> str:
        """Download video from YouTube/Vimeo/Direct link using yt-dlp."""
        output_template = os.path.join(self.output_dir, f"{video_id}_raw.%(ext)s")
        logger.info(f"Downloading video from {url}...")
        
        cmd = [
            "yt-dlp",
            "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "--merge-output-format", "mp4",
            "-o", output_template,
            url
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            # Find the downloaded file
            for f in os.listdir(self.output_dir):
                if f.startswith(f"{video_id}_raw."):
                    return os.path.join(self.output_dir, f)
            raise FileNotFoundError("Downloaded video file not found")
        except subprocess.CalledProcessError as e:
            logger.error(f"yt-dlp failed: {e.stderr}")
            raise RuntimeError(f"Download failed: {e.stderr}")

    def extract_streams(self, video_path: str, video_id: str) -> Tuple[str, str, Dict[str, Any]]:
        """
        Extract:
        1. 16kHz mono WAV audio (for Whisper / PyAnnote diarization)
        2. 360p low-res visual proxy (for ultra-fast Computer Vision face tracking)
        3. Video metadata (width, height, fps, duration)
        """
        audio_path = os.path.join(self.output_dir, f"{video_id}_audio.wav")
        proxy_path = os.path.join(self.output_dir, f"{video_id}_proxy360.mp4")

        # 1. Extract audio
        logger.info(f"Extracting 16kHz mono audio to {audio_path}")
        audio_cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            audio_path
        ]
        subprocess.run(audio_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # 2. Extract CV visual proxy (scaled to 360p, 15 fps)
        logger.info(f"Extracting visual proxy to {proxy_path}")
        proxy_cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vf", "scale=-2:360,fps=15",
            "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28",
            "-an", proxy_path
        ]
        subprocess.run(proxy_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # 3. Probe video metadata
        metadata = self.get_metadata(video_path)

        return audio_path, proxy_path, metadata

    def get_metadata(self, video_path: str) -> Dict[str, Any]:
        """Probe video dimensions and duration using ffprobe."""
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration:stream=width,height,r_frame_rate",
            "-of", "json", video_path
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(res.stdout)
        
        duration = float(data.get("format", {}).get("duration", 0))
        video_stream = next((s for s in data.get("streams", []) if "width" in s), {})
        width = int(video_stream.get("width", 1920))
        height = int(video_stream.get("height", 1080))
        
        # Calculate fps
        fps_str = video_stream.get("r_frame_rate", "30/1")
        if "/" in fps_str:
            num, den = fps_str.split("/")
            fps = float(num) / float(den) if float(den) != 0 else 30.0
        else:
            fps = float(fps_str)

        return {
            "duration": duration,
            "width": width,
            "height": height,
            "fps": fps
        }
