import sys
import os
import json
import subprocess
import threading
import requests
import tkinter as tk
from tkinter import ttk, scrolledtext

OLLAMA_URL = "http://localhost:11434"
LM_STUDIO_URL = "http://localhost:1234"

class YakshaNativeApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("YAKSHA AI - Local Autonomous Intelligence (Native App)")
        self.geometry("1100x750")
        self.configure(bg="#090c15")

        # Configure styles
        self.style = ttk.Style()
        self.style.theme_use('default')
        self.style.configure('.', background='#090c15', foreground='#e2e8f0')

        # Top Bar Header
        top_frame = tk.Frame(self, bg="#0d1322", height=60, bd=1, relief="solid")
        top_frame.pack(fill="x", side="top", padx=0, pady=0)

        title_label = tk.Label(top_frame, text="YAKSHA AI", font=("Orbitron", 18, "bold"), fg="#00f0ff", bg="#0d1322")
        title_label.pack(side="left", padx=20, pady=10)

        sub_label = tk.Label(top_frame, text="LOCAL NATIVE APP", font=("Rajdhani", 10, "bold"), fg="#ffab00", bg="#0d1322")
        sub_label.pack(side="left", padx=0, pady=10)

        self.status_label = tk.Label(top_frame, text="STATUS: CONNECTED", font=("Rajdhani", 11, "bold"), fg="#00ff88", bg="#0d1322")
        self.status_label.pack(side="right", padx=20)

        # Main Chat Display
        self.chat_display = scrolledtext.ScrolledText(
            self, wrap=tk.WORD, bg="#0d1322", fg="#e2e8f0",
            font=("Segoe UI", 11), insertbackground="#00f0ff",
            bd=0, highlightthickness=1, highlightbackground="#00f0ff"
        )
        self.chat_display.pack(fill="both", expand=True, padx=20, pady=15)
        self.chat_display.config(state=tk.DISABLED)

        # Quick Action Buttons
        quick_frame = tk.Frame(self, bg="#090c15")
        quick_frame.pack(fill="x", padx=20, pady=(0, 10))

        btn_style = {"bg": "#131c31", "fg": "#00f0ff", "font": ("Rajdhani", 10, "bold"), "bd": 0, "padx": 12, "pady": 6, "cursor": "hand2"}

        btn_chrome = tk.Button(quick_frame, text="🌐 Web Browser", command=lambda: self.run_quick("start msedge", "Web Browser"), **btn_style)
        btn_chrome.pack(side="left", padx=5)

        btn_notepad = tk.Button(quick_frame, text="📝 Notepad", command=lambda: self.run_quick("start notepad", "Notepad"), **btn_style)
        btn_notepad.pack(side="left", padx=5)

        btn_explorer = tk.Button(quick_frame, text="📁 File Explorer", command=lambda: self.run_quick("start explorer", "File Explorer"), **btn_style)
        btn_explorer.pack(side="left", padx=5)

        btn_calc = tk.Button(quick_frame, text="🧮 Calculator", command=lambda: self.run_quick("start calc", "Calculator"), **btn_style)
        btn_calc.pack(side="left", padx=5)

        # Input Frame
        input_frame = tk.Frame(self, bg="#090c15")
        input_frame.pack(fill="x", padx=20, pady=(0, 20))

        self.input_entry = tk.Entry(
            input_frame, bg="#131c31", fg="#ffffff",
            font=("Segoe UI", 12), insertbackground="#00f0ff",
            bd=1, relief="solid"
        )
        self.input_entry.pack(side="left", fill="x", expand=True, ipady=8, padx=(0, 10))
        self.input_entry.bind("<Return>", lambda e: self.send_message())

        send_btn = tk.Button(
            input_frame, text="EXECUTE ➔", command=self.send_message,
            bg="#00f0ff", fg="#000000", font=("Orbitron", 10, "bold"),
            bd=0, padx=20, ipady=6, cursor="hand2"
        )
        send_btn.pack(side="right")

        self.append_chat("YAKSHA AI", "System initialized. Welcome Master. I am Yaksha, your native desktop AI agent.")

    def append_chat(self, sender, message):
        self.chat_display.config(state=tk.NORMAL)
        if sender == "YOU":
            self.chat_display.insert(tk.END, f"\nUSER: {message}\n", "user")
        else:
            self.chat_display.insert(tk.END, f"\nYAKSHA: {message}\n", "yaksha")

        self.chat_display.tag_config("user", foreground="#00f0ff", font=("Segoe UI", 11, "bold"))
        self.chat_display.tag_config("yaksha", foreground="#e2e8f0", font=("Segoe UI", 11))
        self.chat_display.see(tk.END)
        self.chat_display.config(state=tk.DISABLED)

    def run_quick(self, cmd, name):
        self.append_chat("YOU", f"Open {name}")
        try:
            subprocess.Popen(cmd, shell=True)
            self.append_chat("YAKSHA", f"⚡ Launched {name} (`{cmd}`).")
        except Exception as e:
            self.append_chat("YAKSHA", f"Failed to launch {name}: {e}")

    def send_message(self):
        text = self.input_entry.get().strip()
        if not text:
            return
        self.input_entry.delete(0, tk.END)
        self.append_chat("YOU", text)

        # Check for open app commands
        text_lower = text.lower()
        if "open chrome" in text_lower or "open browser" in text_lower:
            self.run_quick("start msedge", "Web Browser")
            return
        elif "open notepad" in text_lower:
            self.run_quick("start notepad", "Notepad")
            return
        elif "open explorer" in text_lower or "open files" in text_lower:
            self.run_quick("start explorer", "File Explorer")
            return
        elif "open calc" in text_lower:
            self.run_quick("start calc", "Calculator")
            return

        threading.Thread(target=self.query_llm, args=(text,), daemon=True).start()

    def query_llm(self, user_msg):
        try:
            payload = {
                "model": "qwen3.5:4b",
                "messages": [{"role": "user", "content": user_msg}],
                "stream": False
            }
            r = requests.post(f"{OLLAMA_URL}/api/chat", json=payload, timeout=30)
            if r.status_code == 200:
                reply = r.json()["message"]["content"]
                self.after(0, lambda: self.append_chat("YAKSHA", reply))
                return
        except Exception:
            pass

        try:
            payload = {
                "model": "qwen3.5-4b",
                "messages": [{"role": "user", "content": user_msg}],
                "stream": False
            }
            r = requests.post(f"{LM_STUDIO_URL}/v1/chat/completions", json=payload, timeout=30)
            if r.status_code == 200:
                reply = r.json()["choices"][0]["message"]["content"]
                self.after(0, lambda: self.append_chat("YAKSHA", reply))
                return
        except Exception as e:
            self.after(0, lambda: self.append_chat("YAKSHA", f"Local Model API Connection Error: {e}"))

if __name__ == "__main__":
    app = YakshaNativeApp()
    app.mainloop()
