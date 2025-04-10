#!/bin/bash
echo "Starting Cheat Detection Service with Hot Reloading..."

# Check if HF_TOKEN is set
if [ -z "$HF_TOKEN" ]; then
    echo "HF_TOKEN environment variable not set."
    echo "Running token setup script..."
    python3 setup_token.py
    if [ $? -ne 0 ]; then
        echo "Failed to set up token. Please run setup_token.py manually."
        exit 1
    fi
fi

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
pip install watchdog flask flask-cors python-dotenv requests astor

# Run the service with hot reloading
echo "Starting service with hot reloading..."
python hot_reload.py 