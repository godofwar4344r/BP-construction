"""
Kinetic Caption & Subtitle Generation Engine for OpusClip.
Generates bouncy Hormozi / MrBeast / Neon style karaoke `.ass` files, 
WebGL subtitle layers, and auto-emoji associations.
"""

import os
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger("CaptionEngine")

class CaptionEngine:
    # Emoji dictionary for auto-injection
    EMOJI_MAP = {
        "money": "💰", "cash": "💵", "rich": "🤑", "dollar": "💲",
        "fire": "🔥", "hot": "🔥", "crazy": "🤯", "mind": "🧠",
        "growth": "📈", "scale": "🚀", "rocket": "🚀", "build": "🔨",
        "time": "⏳", "clock": "⏰", "mistake": "❌", "secret": "🤫",
        "love": "❤️", "winner": "🏆", "danger": "⚠️", "idea": "💡"
    }

    PRESETS = {
        "hormozi": {
            "font": "Montserrat",
            "font_size": 68,
            "primary_color": "&H00FFFFFF",      # White
            "highlight_color": "&H0000FFFF",    # Neon Yellow
            "outline_color": "&H00000000",      # Black outline
            "outline_width": 6,
            "uppercase": True,
            "words_per_line": 3
        },
        "mrbeast": {
            "font": "Impact",
            "font_size": 72,
            "primary_color": "&H00FFFFFF",
            "highlight_color": "&H0000FF00",    # Neon Green
            "outline_color": "&H00000000",
            "outline_width": 7,
            "uppercase": True,
            "words_per_line": 2
        },
        "neon_cyber": {
            "font": "Arial",
            "font_size": 64,
            "primary_color": "&H00E0FFFF",
            "highlight_color": "&H00FF00FF",    # Neon Magenta
            "outline_color": "&H00330033",
            "outline_width": 5,
            "uppercase": True,
            "words_per_line": 3
        }
    }

    def generate_ass_script(
        self, 
        words: List[Dict[str, Any]], 
        output_path: str,
        style_preset: str = "hormozi",
        include_emojis: bool = True
    ) -> str:
        """
        Build an Advanced SubStation Alpha (.ass) file with word-by-word karaoke highlights (\k).
        """
        style = self.PRESETS.get(style_preset, self.PRESETS["hormozi"])
        words_per_chunk = style["words_per_line"]

        header = f"""[Script Info]
Title: OpusClip Kinetic Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{style['font']},{style['font_size']},{style['primary_color']},{style['highlight_color']},{style['outline_color']},&H80000000,1,0,0,0,100,100,1,0,1,{style['outline_width']},2,5,40,40,320,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
        events = []
        
        # Group words into short chunks (2-3 words)
        for i in range(0, len(words), words_per_chunk):
            chunk = words[i:i+words_per_chunk]
            if not chunk:
                continue

            chunk_start = self._format_ass_timestamp(chunk[0]["start"])
            chunk_end = self._format_ass_timestamp(chunk[-1]["end"] + 0.1)

            # Build karaoke tags \k<centiseconds>
            karaoke_text = ""
            for w in chunk:
                duration_cs = int((w["end"] - w["start"]) * 100)
                word_text = w["word"].upper() if style["uppercase"] else w["word"]
                
                # Check emoji
                emoji_str = ""
                if include_emojis:
                    clean_w = w["word"].lower().strip(".,!?:;")
                    if clean_w in self.EMOJI_MAP:
                        emoji_str = f" {self.EMOJI_MAP[clean_w]}"

                karaoke_text += f"{{\\k{duration_cs}}}{word_text}{emoji_str} "

            dialogue_line = f"Dialogue: 0,{chunk_start},{chunk_end},Default,,0,0,0,,{karaoke_text.strip()}"
            events.append(dialogue_line)

        ass_content = header + "\n".join(events)
        
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(ass_content)

        return output_path

    def _format_ass_timestamp(self, seconds: float) -> str:
        """Convert float seconds to ASS format: H:MM:SS.CC"""
        hrs = int(seconds // 3600)
        mins = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centisecs = int(round((seconds - int(seconds)) * 100))
        return f"{hrs}:{mins:02d}:{secs:02d}.{centisecs:02d}"
