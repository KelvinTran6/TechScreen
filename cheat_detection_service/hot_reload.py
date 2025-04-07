#!/usr/bin/env python3
"""
Hot reloading script for the cheat detection service.
This script monitors the Python files in the service directory and
automatically restarts the Flask application when changes are detected.
"""
import os
import sys
import time
import subprocess
import signal
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class CodeChangeHandler(FileSystemEventHandler):
    """
    Event handler for file system events.
    """
    def __init__(self, restart_callback):
        """
        Initialize the handler with a callback function to restart the service.
        
        Args:
            restart_callback: Function to call when a code change is detected
        """
        self.restart_callback = restart_callback
        self.last_restart = 0
        self.restart_cooldown = 2  # Minimum seconds between restarts
    
    def on_modified(self, event):
        """
        Handle file modification events.
        
        Args:
            event: The file system event
        """
        # Only restart for Python files
        if event.src_path.endswith('.py'):
            current_time = time.time()
            # Prevent multiple restarts in quick succession
            if current_time - self.last_restart > self.restart_cooldown:
                print(f"\nChange detected in {os.path.basename(event.src_path)}")
                self.restart_callback()
                self.last_restart = current_time

class HotReloader:
    """
    Class to handle hot reloading of the Flask application.
    """
    def __init__(self, app_path, app_module, app_variable):
        """
        Initialize the hot reloader.
        
        Args:
            app_path: Path to the directory containing the Flask app
            app_module: Name of the module containing the Flask app
            app_variable: Name of the variable containing the Flask app
        """
        self.app_path = app_path
        self.app_module = app_module
        self.app_variable = app_variable
        self.process = None
        self.observer = None
    
    def start(self):
        """
        Start the hot reloader.
        """
        print("Starting hot reloader...")
        self.start_flask_app()
        self.start_file_observer()
        
        try:
            # Keep the main thread alive
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping hot reloader...")
            self.stop()
    
    def start_flask_app(self):
        """
        Start the Flask application as a subprocess.
        """
        if self.process:
            self.stop_flask_app()
        
        print("Starting Flask application...")
        self.process = subprocess.Popen(
            [sys.executable, "-c", f"from {self.app_module} import {self.app_variable}; {self.app_variable}.run(host='0.0.0.0', port=5001, debug=False)"],
            cwd=self.app_path
        )
    
    def stop_flask_app(self):
        """
        Stop the Flask application subprocess.
        """
        if self.process:
            print("Stopping Flask application...")
            self.process.terminate()
            self.process.wait()
            self.process = None
    
    def restart_flask_app(self):
        """
        Restart the Flask application.
        """
        print("Restarting Flask application...")
        self.stop_flask_app()
        time.sleep(0.5)  # Give the process time to fully terminate
        self.start_flask_app()
    
    def start_file_observer(self):
        """
        Start the file system observer.
        """
        if self.observer:
            self.stop_file_observer()
        
        print("Starting file observer...")
        self.observer = Observer()
        handler = CodeChangeHandler(self.restart_flask_app)
        self.observer.schedule(handler, self.app_path, recursive=False)
        self.observer.start()
    
    def stop_file_observer(self):
        """
        Stop the file system observer.
        """
        if self.observer:
            print("Stopping file observer...")
            self.observer.stop()
            self.observer.join()
            self.observer = None
    
    def stop(self):
        """
        Stop the hot reloader.
        """
        self.stop_file_observer()
        self.stop_flask_app()

if __name__ == "__main__":
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create and start the hot reloader
    reloader = HotReloader(
        app_path=script_dir,
        app_module="app",
        app_variable="app"
    )
    reloader.start() 