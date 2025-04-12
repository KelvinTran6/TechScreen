import React, { useState, useEffect } from 'react';
import { Box, Container, CssBaseline, Snackbar, Alert, Paper, Typography, Switch, FormControlLabel, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import ProblemDescription from './components/ProblemDescription';
import CodeEditor from './components/CodeEditor';
import TestResults from './components/TestResults';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import { TestCase, TestResult, Parameter } from './types';
import axios from 'axios';
import CodingEnvironment from './components/CodingEnvironment';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext';
import { RecoilRoot } from 'recoil';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const LOGGING_URL = process.env.REACT_APP_LOGGING_URL || 'http://localhost:5001';
const ENABLE_LOGGING = process.env.REACT_APP_ENABLE_LOGGING === 'true';

// Define the session state type
interface SessionState {
  sessionId: string;
  role: 'interviewer' | 'interviewee';
  code: string;
  testCases: any[];
  problemStatement: string;
}

// Wrapper component to handle session state
const CodingEnvironmentWrapper: React.FC = () => {
  const { sessionId, role, sessionError, socket, joinSession } = useWebSocket();
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [sessionConfirmed, setSessionConfirmed] = useState(false);

  // Get session ID from URL
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();

  // Handle direct navigation to a session URL
  useEffect(() => {
    if (!urlSessionId) return;
    
    // If we're already in this session, no need to join again
    if (sessionId === urlSessionId) {
      setSessionConfirmed(true);
      return;
    }
    
    // Determine role based on whether we have a sessionId in the context
    const userRole = sessionId ? 'interviewer' : 'interviewee';
    
    // Set joining state
    setIsJoining(true);
    
    // Join the session
    joinSession(urlSessionId, userRole);
    
    // If WebSocket is not available, the joinSession function will simulate joining
    // and set the sessionId and role directly
    if (!socket) {
      setSessionConfirmed(true);
      setIsJoining(false);
      return;
    }
    
    // Listen for session state event
    const handleSessionState = (state: SessionState) => {
      console.log('Session state received in CodingEnvironmentWrapper:', state);
      if (state.sessionId === urlSessionId) {
        setSessionConfirmed(true);
        setIsJoining(false);
      }
    };
    
    // Listen for session error event
    const handleSessionError = () => {
      setIsJoining(false);
      setShowError(true);
      // Redirect back to landing page after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    };
    
    socket.on('session_state', handleSessionState);
    socket.on('session_error', handleSessionError);
    
    return () => {
      socket.off('session_state', handleSessionState);
      socket.off('session_error', handleSessionError);
    };
  }, [socket, urlSessionId, sessionId, joinSession, navigate]);

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      setShowError(true);
      // Redirect back to landing page after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [sessionError, navigate]);

  // If no sessionId is provided, redirect to landing page
  if (!urlSessionId) {
    navigate('/');
    return null;
  }

  // Show loading state while joining
  if (isJoining) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        bgcolor: '#1E1E1E',
        color: '#FFFFFF'
      }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h5">Joining session...</Typography>
      </Box>
    );
  }

  // Only render the CodingEnvironment when the session is confirmed
  if (!sessionConfirmed) {
    return null;
  }

  return (
    <>
      <CodingEnvironment 
        isInterviewer={role === 'interviewer'} 
        sessionId={urlSessionId} 
      />
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {sessionError || 'An error occurred with the session. Redirecting to home page...'}
        </Alert>
      </Snackbar>
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Router>
        <WebSocketProvider>
          <CssBaseline />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            height: '100vh',
            overflow: 'hidden'
          }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/session/:sessionId" element={<CodingEnvironmentWrapper />} />
            </Routes>
          </Box>
        </WebSocketProvider>
      </Router>
    </RecoilRoot>
  );
};

export default App;
