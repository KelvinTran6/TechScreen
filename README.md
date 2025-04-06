# TechScreen

A coding environment for technical interviews with real-time code execution and test case management.

## Project Structure

The project is split into two main directories:
- `frontend/`: React/TypeScript frontend application
- `backend/`: Node.js/Express backend server

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Quick Start

We provide development scripts to quickly set up and run the application:

#### Windows
```powershell
# Run the PowerShell script
.\dev.ps1
```

#### Unix-like systems (Linux/macOS)
```bash
# Make the script executable
chmod +x dev.sh

# Run the shell script
./dev.sh
```

### Manual Installation

If you prefer to set up manually:

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Install backend dependencies:
```bash
cd ../backend
npm install
```

### Running the Application

#### Using the Development Scripts
The development scripts will:
- Install all dependencies
- Start the backend server in development mode
- Start the frontend development server

#### Manual Start
1. Start the backend server:
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Features

- Real-time code execution
- Test case management
- Syntax highlighting
- Interviewer mode with example toggles
- Responsive design

## Development

### Frontend
The frontend is built with:
- React
- TypeScript
- Material-UI
- Monaco Editor

### Backend
The backend is built with:
- Node.js
- Express
- Python (for code execution)

## License

This project is licensed under the MIT License. 