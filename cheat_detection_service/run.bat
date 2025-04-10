@echo off
echo Starting Cheat Detection Service with Hot Reloading...

REM Check if .env file exists
if not exist .env (
    echo .env file not found.
    echo Running token setup script...
    python setup_token.py
    if errorlevel 1 (
        echo Failed to set up token. Please run setup_token.py manually.
        exit /b 1
    )
)

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
pip install --upgrade pip
pip install -r requirements.txt

REM Run the service with hot reloading
echo Starting service with hot reloading...
python hot_reload.py
