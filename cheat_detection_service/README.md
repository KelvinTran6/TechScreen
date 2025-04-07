# Cheat Detection Service

A Flask-based service that checks if a candidate's code might be cheating.

## Features

- Simple API for checking code for potential cheating
- Hot reloading for development (automatically restarts when code changes)
- Health check endpoint

## Running the Service

### With Hot Reloading (Recommended for Development)

Start the service with hot reloading:
- Windows:
  ```
  run.bat
  ```
- macOS/Linux:
  ```
  ./run.sh
  ```

The scripts will:
1. Create a virtual environment if it doesn't exist
2. Activate the virtual environment
3. Install all required dependencies
4. Start the service with hot reloading

The service will automatically restart when you make changes to any Python file in the service directory.

### Manual Setup (Alternative)

If you prefer to set up the environment manually:

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the service:
   ```
   python app.py
   ```

## API Endpoints

### Check Code for Cheating

**Endpoint:** `/check-code`

**Method:** POST

**Request Body:**
```json
{
  "problem_statement": "The problem statement text",
  "candidate_code": "The candidate's code",
  "language": "python"
}
```

**Response:**
```json
{
  "is_cheating": false,
  "confidence": 0.0,
  "explanation": "No obvious signs of cheating detected.",
  "suspicious_patterns": []
}
```

### Health Check

**Endpoint:** `/health`

**Method:** GET

**Response:**
```json
{
  "status": "ok"
}
```

## Development

### Hot Reloading

The service includes a hot reloading feature that automatically restarts the Flask application when changes are detected in Python files. This is implemented using the `watchdog` library.

The hot reloading is handled by the `hot_reload.py` script, which:
1. Starts the Flask application as a subprocess
2. Monitors the service directory for file changes
3. Restarts the Flask application when changes are detected

### Testing

You can test the service using the provided test script:
```
python test_service.py
```

This will test both the health check endpoint and the check-code endpoint with clean and suspicious code. 