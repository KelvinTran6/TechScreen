#!/bin/bash
echo "Starting Cheat Detection Service with Hot Reloading..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup..."
    python3 -m venv venv
else
    echo "Virtual environment found."
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
pip install watchdog flask flask-cors python-dotenv requests

# Run the service with hot reloading
echo "Starting service with hot reloading..."
python hot_reload.py 