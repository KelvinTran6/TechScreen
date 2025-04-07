@echo off
echo Starting Cheat Detection Service with Hot Reloading...

REM Check if virtual environment exists
if not exist venv (
    echo Virtual environment not found. Running setup...
    python -m venv venv
) else (
    echo Virtual environment found.
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
pip install watchdog flask flask-cors python-dotenv requests

REM Run the service with hot reloading
echo Starting service with hot reloading...
python hot_reload.py 