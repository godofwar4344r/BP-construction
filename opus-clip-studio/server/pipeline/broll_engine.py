"""
Auto B-Roll & Visual Asset Overlay Engine.
Fetches high-quality stock footage from Pexels API or local curated visual asset library,
calculates Ken Burns motion transformations, and prepares overlay tracks.
"""

import os
import requests
import logging
from typing import List, Dict, Any

logger = logging.getLogger("BRollEngine")

class BRollEngine:
    def __init__(self, pexels_api_key: str = None):
        self.pexels_api_key = pexels_api_key or os.getenv("PEXELS_API_KEY")

    def find_broll_segments(
        self, 
        words: List[Dict[str, Any]], 
        keywords: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Identify high-impact moments in the transcript to insert 2.5 - 4.0 second B-roll clips.
        """
        broll_clips = []
        if not words:
            return broll_clips

        # Visual triggers dictionary
        concept_map = {
            "money": ["cash flow", "luxury lifestyle", "financial chart"],
            "business": ["modern office", "team working", "handshake deal"],
            "scale": ["rocket launch", "city skyline", "growth graph"],
            "focus": ["deep concentration", "clock ticking", "coding screen"],
            "mistake": ["frustrated person", "traffic jam", "warning sign"],
            "secret": ["magnifying glass", "vault door", "whispering"]
        }

        # Scan words for visual trigger keywords
        for i in range(0, len(words) - 5, 12):
            segment_words = words[i:i+6]
            seg_text = " ".join([w["word"].lower() for w in segment_words])
            
            matched_tag = None
            for key in concept_map:
                if key in seg_text:
                    matched_tag = key
                    break

            if matched_tag or (i % 20 == 0 and i > 0):
                tag = matched_tag or "business"
                query = concept_map.get(tag, ["modern lifestyle"])[0]
                start_t = segment_words[0]["start"]
                end_t = min(start_t + 3.2, segment_words[-1]["end"] + 1.0)

                broll_clips.append({
                    "id": f"broll_{len(broll_clips)+1}",
                    "start_time": round(start_t, 2),
                    "end_time": round(end_t, 2),
                    "duration": round(end_t - start_t, 2),
                    "query": query,
                    "tag": tag,
                    "ken_burns_effect": "zoom_in", # zoom_in, zoom_out, pan_right
                    "media_url": self._fetch_stock_video_url(query)
                })

        return broll_clips

    def _fetch_stock_video_url(self, query: str) -> str:
        """Fetch vertical stock footage URL from Pexels API or fallback library."""
        if self.pexels_api_key:
            try:
                headers = {"Authorization": self.pexels_api_key}
                url = f"https://api.pexels.com/videos/search?query={query}&orientation=portrait&per_page=1"
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    videos = data.get("videos", [])
                    if videos:
                        video_files = videos[0].get("video_files", [])
                        # Choose HD or best MP4
                        for vf in video_files:
                            if vf.get("quality") == "hd" and vf.get("file_type") == "video/mp4":
                                return vf["link"]
                        if video_files:
                            return video_files[0]["link"]
            except Exception as e:
                logger.warning(f"Pexels search failed for '{query}': {e}")

        # High-res curated fallback royalty-free vertical video URLs for instant preview
        sample_brolls = {
            "money": "https://assets.mixkit.co/videos/preview/mixkit-counting-money-bills-41517-large.mp4",
            "business": "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-42999-large.mp4",
            "rocket": "https://assets.mixkit.co/videos/preview/mixkit-rocket-taking-off-towards-space-40626-large.mp4",
            "city": "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-night-42894-large.mp4"
        }
        for k, v in sample_brolls.items():
            if k in query:
                return v
        return sample_brolls["business"]
