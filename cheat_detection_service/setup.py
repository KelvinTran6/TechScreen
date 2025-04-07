#!/usr/bin/env python3
"""
Script to set up the virtual environment and install dependencies.
"""
import os
import subprocess
import sys
import platform

def run_command(command):
    """Run a command and print its output."""
    print(f"Running: {command}")
    process = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True
    )
    
    for line in process.stdout:
        print(line, end='')
    
    process.wait()
    return process.returncode

def main():
    """Set up the virtual environment and install dependencies."""
    # Check if Python is installed
    python_version = platform.python_version()
    print(f"Python version: {python_version}")
    
    # Create virtual environment
    venv_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'venv')
    if not os.path.exists(venv_dir):
        print("Creating virtual environment...")
        run_command(f"{sys.executable} -m venv {venv_dir}")
    else:
        print("Virtual environment already exists.")
    
    # Determine the pip path based on the operating system
    if platform.system() == 'Windows':
        pip_path = os.path.join(venv_dir, 'Scripts', 'pip')
    else:
        pip_path = os.path.join(venv_dir, 'bin', 'pip')
    
    # Install dependencies
    print("Installing dependencies...")
    requirements_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'requirements.txt')
    run_command(f"{pip_path} install -r {requirements_path}")
    
    print("\nSetup complete!")
    print("\nTo activate the virtual environment:")
    if platform.system() == 'Windows':
        print(f"    {os.path.join(venv_dir, 'Scripts', 'activate')}")
    else:
        print(f"    source {os.path.join(venv_dir, 'bin', 'activate')}")
    
    print("\nTo run the service:")
    print("    python app.py")

if __name__ == '__main__':
    main() 