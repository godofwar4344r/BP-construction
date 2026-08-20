import os
import sys
import threading
import time
import socket
import webbrowser
import uvicorn
import webview
from server import app

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def start_server():
    if not is_port_in_use(8000):
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

if __name__ == "__main__":
    # Start backend server in daemon thread if not already running
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Wait for server readiness
    time.sleep(1.0)
    
    # Open default browser for full Web Speech API voice support
    webbrowser.open("http://127.0.0.1:8000")
    
    # Create native desktop window
    try:
        window = webview.create_window(
            title="YAKSHA AI - Local Autonomous Intelligence",
            url="http://127.0.0.1:8000",
            width=1280,
            height=850,
            resizable=True,
            min_size=(900, 600)
        )
        webview.start(private_mode=False)
    except Exception as e:
        print(f"Native desktop window closed or fallback: {e}")

