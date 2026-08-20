"""
FastAPI Server for OpusClip Studio.
Exposes REST and SSE endpoints for full end-to-end video repurposing pipelines.
"""

import os
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from pipeline.ingestion import VideoIngester
from pipeline.transcriber import SpeechTranscriber
from pipeline.virality_curator import ViralityCurator
from pipeline.face_tracker import FaceTracker
from pipeline.broll_engine import BRollEngine
from pipeline.caption_engine import CaptionEngine
from pipeline.renderer import VideoRenderer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OpusServer")

app = FastAPI(title="OpusClip AI Studio API", version="1.0.0")

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage directories
STORAGE_DIR = os.path.abspath("./storage")
os.makedirs(os.path.join(STORAGE_DIR, "media"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_DIR, "rendered"), exist_ok=True)
os.makedirs(os.path.join(STORAGE_DIR, "subtitles"), exist_ok=True)

# Mount static files
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

# Initialize pipeline instances
ingester = VideoIngester(output_dir=os.path.join(STORAGE_DIR, "media"))
transcriber = SpeechTranscriber()
curator = ViralityCurator()
face_tracker = FaceTracker()
broll_engine = BRollEngine()
caption_engine = CaptionEngine()
renderer = VideoRenderer(output_dir=os.path.join(STORAGE_DIR, "rendered"))

# In-memory project state store
PROJECTS_DB: Dict[str, Any] = {}

class ProcessRequest(BaseModel):
    url: Optional[str] = None
    target_duration: Optional[str] = "30-60s" # <30s, 30-60s, 60-90s, auto
    caption_preset: Optional[str] = "hormozi" # hormozi, mrbeast, neon_cyber

class RenderRequest(BaseModel):
    project_id: str
    clip_id: str
    caption_style: Optional[str] = "hormozi"
    include_emojis: Optional[bool] = True
    layout_mode: Optional[str] = "auto_track" # auto_track, split_screen, blur_bg

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OpusClip AI Pipeline Engine",
        "features": [
            "yt-dlp ingestion",
            "whisperx transcription",
            "ai virality scoring",
            "face tracking 9:16 reframe",
            "kinetic caption generator",
            "auto b-roll engine",
            "ffmpeg nvenc rendering"
        ]
    }

@app.post("/api/process")
async def process_video(
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    caption_preset: str = Form("hormozi")
):
    project_id = str(uuid.uuid4())[:8]
    logger.info(f"Starting pipeline for project {project_id}")

    try:
        # Step 1: Ingestion
        if url:
            video_path = ingester.download_url(url, project_id)
        elif file:
            video_path = os.path.join(STORAGE_DIR, "media", f"{project_id}_{file.filename}")
            with open(video_path, "wb") as f:
                content = await file.read()
                f.write(content)
        else:
            raise HTTPException(status_code=400, detail="Must provide either 'url' or 'file'")

        # Step 2: Stream Extraction
        audio_path, proxy_path, meta = ingester.extract_streams(video_path, project_id)

        # Step 3: Transcription & Alignment
        words = transcriber.transcribe_and_align(audio_path)

        # Step 4: AI Virality Curation
        clips = curator.curate_clips(words)

        # Step 5: Face Tracking & Reframing
        tracking_data = face_tracker.track_and_reframe(proxy_path or video_path)

        # Step 6: Auto B-Roll Discovery
        for clip in clips:
            clip_words = clip.get("words", [])
            clip["brolls"] = broll_engine.find_broll_segments(clip_words, clip.get("broll_keywords"))

        # Save project state
        project_data = {
            "project_id": project_id,
            "video_path": video_path,
            "audio_path": audio_path,
            "meta": meta,
            "words": words,
            "clips": clips,
            "tracking": tracking_data,
            "status": "completed"
        }
        PROJECTS_DB[project_id] = project_data

        return {
            "success": True,
            "project_id": project_id,
            "meta": meta,
            "clips": clips,
            "total_words": len(words)
        }

    except Exception as e:
        logger.exception("Processing error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/render")
def render_clip(req: RenderRequest):
    project = PROJECTS_DB.get(req.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    clip = next((c for c in project["clips"] if c["id"] == req.clip_id), None)
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    # Generate ASS subtitles for this clip
    sub_path = os.path.join(STORAGE_DIR, "subtitles", f"{req.project_id}_{req.clip_id}.ass")
    caption_engine.generate_ass_script(
        words=clip.get("words", []),
        output_path=sub_path,
        style_preset=req.caption_style or "hormozi",
        include_emojis=req.include_emojis
    )

    # Render video
    output_path = renderer.render_short_clip(
        raw_video_path=project["video_path"],
        clip_id=f"{req.project_id}_{req.clip_id}",
        start_time=clip["start_time"],
        end_time=clip["end_time"],
        ass_subtitle_path=sub_path,
        broll_clips=clip.get("brolls", [])
    )

    return {
        "success": True,
        "clip_id": req.clip_id,
        "video_url": f"/storage/rendered/{os.path.basename(output_path)}",
        "subtitle_url": f"/storage/subtitles/{os.path.basename(sub_path)}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
