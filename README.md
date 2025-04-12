# TechScreen

A real-time collaborative coding interview platform.

## Features

- Real-time code execution
- Test case management
- Real-time collaboration between interviewer and interviewee
- Cheat detection service

## WebSocket Implementation

The application uses Socket.IO for real-time communication between the interviewer and interviewee. Here's how it works:

### Backend

The WebSocket server (`backend/websocket.js`) handles:
- Session management
- Real-time code updates
- Test case synchronization
- Problem statement updates
- Participant tracking

### Frontend

The WebSocket client (`frontend/src/contexts/WebSocketContext.tsx`) provides:
- Connection management
- Session joining/leaving
- Real-time updates for code, test cases, and problem statements
- Role-based access control (interviewer/interviewee)

## Getting Started

1. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. Start the servers:
   ```bash
   # Backend (from backend directory)
   npm run dev

   # Frontend (from frontend directory)
   npm start
   ```

3. Open your browser to `http://localhost:3000`

## Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `PYTHON_PATH`: Path to Python executable (default: python)

### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)
- `REACT_APP_WS_URL`: WebSocket server URL (default: http://localhost:5000)
- `REACT_APP_CHEAT_DETECTION_URL`: Cheat detection service URL (default: http://localhost:5001)

## Session Management

1. Create a new session:
   - Click "Start Interview" on the landing page
   - Choose your role (interviewer/interviewee)
   - Share the session ID with your partner

2. Join an existing session:
   - Click "Start Interview"
   - Enter the session ID
   - Choose your role

## Real-time Updates

The following events are synchronized in real-time:
- Code changes
- Test case modifications
- Problem statement updates
- Participant join/leave events

## Development

### Project Structure

```
techscreen/
├── backend/
│   ├── server.js           # Main server file
│   ├── websocket.js        # WebSocket server implementation
│   ├── pythonRunner.js     # Python code execution
│   └── types.js            # Shared type definitions
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   └── package.json        # Frontend dependencies
└── cheat_detection_service/
    ├── app.py              # Flask application
    ├── cheat_detector.py   # Cheat detection logic
    ├── requirements.txt    # Python dependencies
    └── run.bat/run.sh      # Scripts to run the service
```

### Adding New Features

1. Define new WebSocket events in `backend/websocket.js`
2. Add corresponding handlers in `frontend/src/contexts/WebSocketContext.tsx`
3. Update the UI components to use the new WebSocket functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 

## Cheat Detection Service

The project includes a separate Python service for detecting potential cheating in candidate code. This service is located in the `cheat_detection_service` directory.

### Features

- Simple API for checking code for potential cheating
- Hot reloading for development (automatically restarts when code changes)
- Health check endpoint

### Running the Cheat Detection Service

#### Windows
```
cd cheat_detection_service
run.bat
```

#### macOS/Linux
```
cd cheat_detection_service
./run.sh
```

The scripts will automatically:
1. Create a virtual environment if it doesn't exist
2. Activate the virtual environment
3. Install all required dependencies
4. Start the service with hot reloading

The service will automatically restart when you make changes to any Python file in the service directory.

### API Endpoints

#### Check Code for Cheating

**Endpoint:** `http://localhost:5001/check-code`

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

#### Health Check

**Endpoint:** `http://localhost:5001/health`

**Method:** GET

**Response:**
```json
{
  "status": "ok"
}
``` 