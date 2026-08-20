import os
import sys
import json
import asyncio
import subprocess
import threading
import time
import uuid
from datetime import datetime
from pathlib import Path
import requests
import psutil
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Yaksha AI")

ROOT = Path(__file__).parent
SCHEDULE_FILE = ROOT / "schedules.json"
# Trusted actions for voice commands and automation
TRUSTED_ACTIONS = {
    # Basic apps
    "browser": ("Open Browser", ["cmd", "/c", "start", "", "msedge"]),
    "notepad": ("Open Notepad", ["notepad"]),
    "explorer": ("Open File Explorer", ["explorer"]),
    "calculator": ("Open Calculator", ["calc"]),
    
    # Voice command automation
    "type_text": ("Type Text", ["cmd", "/c", "echo"]),  # Placeholder for keyboard typing
    "copy_file": ("Copy File", ["robocopy", "/MIR"]),  # Placeholder for file copy
    "search_web": ("Search Web", ["start", "msedge"]),  # Opens browser for search
    "run_command": ("Run Command", ["cmd.exe", "/k"]),  # Keep window open for commands
}

def _read_schedules():
    try:
        return json.loads(SCHEDULE_FILE.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def _write_schedules(items):
    SCHEDULE_FILE.write_text(json.dumps(items, indent=2), encoding="utf-8")

def _run_trusted_action(action):
    if action not in TRUSTED_ACTIONS:
        raise ValueError("Unknown trusted action")
    subprocess.Popen(TRUSTED_ACTIONS[action][1])

def _schedule_worker():
    while True:
        now, remaining, changed = datetime.now(), [], False
        for job in _read_schedules():
            if datetime.fromisoformat(job["run_at"]) <= now:
                try:
                    _run_trusted_action(job["action"])
                except Exception:
                    pass
                changed = True
            else:
                remaining.append(job)
        if changed:
            _write_schedules(remaining)
        time.sleep(10)

threading.Thread(target=_schedule_worker, daemon=True).start()

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

OLLAMA_URL = "http://localhost:11434"
LM_STUDIO_URL = "http://localhost:1234"

SYSTEM_PROMPT = """You are YAKSHA, an advanced AI agent operating locally on the user's laptop.
You replace Jarvis as the ultimate personal AI assistant.

VOICE COMMANDS YOU CAN EXECUTE:
- 'Open Google' or 'Go to google.com' → Open browser
- 'Type hello world' → Type text on keyboard (via pyautogui)
- 'Copy this file' → Copy files using robocopy
- 'Search Python tutorials' → Search web and open results
- 'Run python script' → Execute terminal commands with cmd.exe /k
- 'Move files to folder' → Organize files using xcopy/move command
- 'Check system status' → Display CPU, RAM, disk usage
- 'Open Notepad' or 'Write something' → Launch notepad application
- 'Open File Explorer' → Navigate file system
- 'Open Calculator' → Launch calculator app

When executing commands:
1. First check if it's a trusted action from TRUSTED_ACTIONS
2. For keyboard/mouse tasks, use pyautogui library (install: pip install pyautogui)
3. For file operations, use robocopy/xcopy commands
4. For web searches, open browser and navigate to search engine
5. Always mention what you're doing in your response
6. Provide feedback on command execution status
7. If a command fails, explain the error clearly

You have access to:
- Browser automation (via cmd start msedge)
- File operations (robocopy, xcopy, move commands)
- Terminal commands (cmd.exe /k for interactive shells)
- System monitoring (psutil for CPU/RAM/disk stats)
- Text-to-speech feedback (pyttsx3 for voice responses)

Be helpful, concise, and always confirm actions taken."""

@app.get("/", response_class=HTMLResponse)
def index():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>Yaksha AI Server Running</h1>"

@app.get("/api/status")
def get_status():
    mem = psutil.virtual_memory()
    cpu = psutil.cpu_percent(interval=None)
    disk = psutil.disk_usage(str(ROOT.anchor))
    
    ollama_online = False
    lm_online = False
    models = []
    
    # Check Ollama
    try:
        r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=1.5)
        if r.status_code == 200:
            ollama_online = True
            for m in r.json().get("models", []):
                models.append({"name": m["name"], "source": "Ollama API"})
    except Exception:
        pass

    # Check LM Studio
    try:
        r = requests.get(f"{LM_STUDIO_URL}/v1/models", timeout=1.5)
        if r.status_code == 200:
            lm_online = True
            for m in r.json().get("data", []):
                models.append({"name": m["id"], "source": "LM Studio API"})
    except Exception:
        pass

    # Prefer the practical local-chat model over a potentially much slower
    # "latest" tag. The browser uses the first returned model as its default.
    models.sort(key=lambda model: (0 if model["name"] == "qwen3.5:4b" else 1, model["name"]))
        
    return {
        "status": "online",
        "ram_used_gb": round((mem.total - mem.available) / (1024**3), 2),
        "ram_total_gb": round(mem.total / (1024**3), 2),
        "ram_percent": mem.percent,
        "ram_used_gb": round((mem.total - mem.available) / (1024**3), 2),
        "ram_total_gb": round(mem.total / (1024**3), 2),
        "cpu_percent": cpu,
        "cpu_cores": psutil.cpu_count(logical=True),
        "disk_used_gb": round(disk.used / (1024**3), 2),
        "disk_total_gb": round(disk.total / (1024**3), 2),
        "booted_at": datetime.fromtimestamp(psutil.boot_time()).isoformat(),
        "ollama_online": ollama_online,
        "lm_online": lm_online,
        "models": models
    }

@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    user_msg = data.get("message", "")
    model_name = data.get("model", "qwen3.5:4b")
    
    if not user_msg:
        return JSONResponse({"error": "Empty message"}, status_code=400)
        
    msg_lower = user_msg.lower().strip()
    cmd_to_run = None
    action_type = None
    
    # Enhanced voice command recognition for Jarvis-like functionality
    if any(x in msg_lower for x in ["open google", "go to google", "search google"]):
        cmd_to_run = "start msedge"
        action_type = "Web Browser - Google Search"
    elif any(x in msg_lower for x in ["open chrome", "open browser", "launch browser"]):
        cmd_to_run = "start msedge"
        action_type = "Web Browser"
    elif any(x in msg_lower for x in ["type", "write", "enter", "input"]):
        # For typing commands, we'll use a special handler
        if "hello world" in msg_lower or "hi" in msg_lower:
            cmd_to_run = "echo hello world"
            action_type = "Keyboard Typing - Text Message"
        elif "this file" in msg_lower or "that file" in msg_lower:
            # Will be handled by AI with specific file path
            cmd_to_run = None  # Let AI handle it
            action_type = "File Operation - Copy/Move"
    elif any(x in msg_lower for x in ["copy", "duplicate"]):
        if "file" in msg_lower:
            cmd_to_run = "robocopy /MIR"
            action_type = "File Operation - Copy Files"
        else:
            # Let AI handle specific file paths
            cmd_to_run = None
            action_type = "AI Decision Required"
    elif any(x in msg_lower for x in ["move", "transfer"]):
        if "file" in msg_lower or "folder" in msg_lower:
            cmd_to_run = "xcopy /E /I /Q"
            action_type = "File Operation - Move Files"
        else:
            cmd_to_run = None
            action_type = "AI Decision Required"
    elif any(x in msg_lower for x in ["search", "find"]):
        if "web" in msg_lower or "online" in msg_lower:
            cmd_to_run = "start msedge"
            action_type = "Web Search - Browser Opens"
        else:
            # Let AI handle specific search queries
            cmd_to_run = None
            action_type = "AI Decision Required"
    elif any(x in msg_lower for x in ["run", "execute"]):
        if "python" in msg_lower or "script" in msg_lower:
            cmd_to_run = "cmd.exe /k python"
            action_type = "Terminal - Python Execution"
        else:
            # Let AI handle specific commands
            cmd_to_run = None
            action_type = "AI Decision Required"
    elif any(x in msg_lower for x in ["check", "status", "system"]):
        if "cpu" in msg_lower or "ram" in msg_lower or "disk" in msg_lower:
            # Will be handled by AI with system monitoring
            cmd_to_run = None  # Let AI query psutil directly
            action_type = "System Monitoring"
    elif any(x in msg_lower for x in ["open notepad", "write"]):
        cmd_to_run = "start notepad"
        action_type = "Notepad"
    elif any(x in msg_lower for x in ["open explorer", "files", "navigate"]):
        cmd_to_run = "start explorer"
        action_type = "File Explorer"
    elif any(x in msg_lower for x in ["open calc", "calculator"]):
        cmd_to_run = "start calc"
        action_type = "Calculator"

    reply_text = ""
    command_result = None

    if cmd_to_run:
        try:
            subprocess.Popen(cmd_to_run, shell=True)
            command_result = {"status": "success", "command": cmd_to_run, "output": f"Executed: {cmd_to_run}"}
            reply_text = f"Certainly! Launched **{action_type}** (`{cmd_to_run}`)."
            return {"reply": reply_text, "command_result": command_result}
        except Exception as e:
            command_result = {"status": "error", "command": cmd_to_run, "output": str(e)}
            reply_text = f"Failed to execute `{cmd_to_run}`: {e}"
            return {"reply": reply_text, "command_result": command_result}

    # Route request to Ollama API first
    try:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg}
            ],
            "stream": False,
            # Qwen's internal reasoning can consume 90+ seconds for a simple
            # chat turn. Keep it off for this interactive assistant so the UI
            # responds promptly; it can still reason in the normal response.
            "think": False,
            "options": {"num_predict": 512}
        }
        r = await asyncio.to_thread(requests.post, f"{OLLAMA_URL}/api/chat", json=payload, timeout=90)
        if r.status_code == 200:
            reply_text = r.json()["message"]["content"]
            return {"reply": reply_text, "command_result": None}
    except Exception:
        pass

    # Fallback to LM Studio API
    try:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_msg}
            ],
            "stream": False,
            "max_tokens": 512,
            "reasoning_effort": "none"
        }
        r = await asyncio.to_thread(requests.post, f"{LM_STUDIO_URL}/v1/chat/completions", json=payload, timeout=90)
        if r.status_code == 200:
            reply_text = r.json()["choices"][0]["message"]["content"]
            return {"reply": reply_text, "command_result": None}
    except Exception as e:
        reply_text = f"API Error: Could not connect to local model server. Error: {e}"

    return {"reply": reply_text, "command_result": None}

# The control center exposes only this small allowlist; it deliberately has no
# endpoint that accepts arbitrary shell commands from the browser.
@app.get("/api/actions")
def trusted_actions():
    return [{"id": key, "name": value[0]} for key, value in TRUSTED_ACTIONS.items()]

@app.post("/api/actions/{action}")
def run_action(action: str):
    try:
        _run_trusted_action(action)
        return {"message": f"Launched {TRUSTED_ACTIONS[action][0]}."}
    except ValueError as error:
        return JSONResponse({"error": str(error)}, status_code=400)

@app.get("/api/schedules")
def schedules():
    return _read_schedules()

@app.post("/api/schedules")
async def create_schedule(request: Request):
    data = await request.json()
    action, run_at = data.get("action"), data.get("run_at")
    if action not in TRUSTED_ACTIONS:
        return JSONResponse({"error": "Choose a trusted action."}, status_code=400)
    try:
        scheduled_time = datetime.fromisoformat(run_at)
        if scheduled_time <= datetime.now():
            raise ValueError
    except (TypeError, ValueError):
        return JSONResponse({"error": "Choose a future time."}, status_code=400)
    job = {"id": str(uuid.uuid4()), "action": action, "action_name": TRUSTED_ACTIONS[action][0], "run_at": scheduled_time.isoformat()}
    jobs = _read_schedules()
    jobs.append(job)
    _write_schedules(jobs)
    return job

@app.delete("/api/schedules/{job_id}")
def delete_schedule(job_id: str):
    _write_schedules([job for job in _read_schedules() if job["id"] != job_id])
    return {"ok": True}

@app.post("/api/tts")
async def tts_speak(request: Request):
    data = await request.json()
    text = data.get("text", "")
    if not text:
        return JSONResponse({"error": "Empty text"}, status_code=400)
    
    clean_text = text.replace("*", "").replace("#", "").replace("`", "").replace("~", "")
    
    def _generate_audio():
        import pyttsx3
        import tempfile
        from fastapi.responses import FileResponse
        
        temp_dir = tempfile.gettempdir()
        temp_file = os.path.join(temp_dir, f"yaksha_tts_{uuid.uuid4().hex}.wav")
        
        engine = pyttsx3.init()
        engine.setProperty('rate', 175)
        voices = engine.getProperty('voices')
        for v in voices:
            if "english" in v.name.lower() or "david" in v.name.lower() or "zira" in v.name.lower():
                engine.setProperty('voice', v.id)
                break
        
        engine.save_to_file(clean_text, temp_file)
        engine.runAndWait()
        return temp_file

    try:
        audio_file = await asyncio.to_thread(_generate_audio)
        from fastapi.responses import FileResponse
        return FileResponse(audio_file, media_type="audio/wav")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

