@echo off
title YAKSHA AI - Local Autonomous Intelligence
echo ====================================================
echo    LAUNCHING YAKSHA AI (JARVIS REPLACEMENT)
echo ====================================================
echo.
echo Starting Yaksha Server on http://localhost:8000...
echo.
timeout /t 2 /nobreak > nul
start http://localhost:8000
python "d:\EXPERIMENT\yaksha-ai\server.py"
pause
