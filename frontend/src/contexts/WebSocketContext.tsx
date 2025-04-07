import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { TestCase } from '../types';

// Define the context type
interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sessionId: string | null;
  role: 'interviewer' | 'interviewee' | null;
  sessionError: string | null;
  sessionState: {
    code: string;
    testCases: TestCase[];
    problemStatement: string;
  } | null;
  joinSession: (sessionId: string, role: 'interviewer' | 'interviewee') => void;
  leaveSession: (sessionId: string) => void;
  sendCodeUpdate: (sessionId: string, code: string) => void;
  sendTestCaseUpdate: (sessionId: string, testCases: TestCase[]) => void;
  sendProblemStatementUpdate: (sessionId: string, problemStatement: string) => void;
  clearSessionError: () => void;
}

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  sessionId: null,
  role: null,
  sessionError: null,
  sessionState: null,
  joinSession: () => {},
  leaveSession: () => {},
  sendCodeUpdate: () => {},
  sendTestCaseUpdate: () => {},
  sendProblemStatementUpdate: () => {},
  clearSessionError: () => {},
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// WebSocket provider component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<'interviewer' | 'interviewee' | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<'interviewer' | 'interviewee' | null>(null);
  const [sessionState, setSessionState] = useState<{
    code: string;
    testCases: TestCase[];
    problemStatement: string;
  } | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Check if we're in a session URL
    const path = window.location.pathname;
    const sessionMatch = path.match(/\/session\/([^\/]+)/);
    const sessionIdFromUrl = sessionMatch ? sessionMatch[1] : null;
    
    // If we're in a session URL but not connected to a WebSocket server,
    // we'll simulate a session state
    if (sessionIdFromUrl && !socket) {
      console.log('Simulating session state for URL session:', sessionIdFromUrl);
      
      // Determine role based on URL
      const isInterviewer = path.includes('/interview/');
      const role = isInterviewer ? 'interviewer' : 'interviewee';
      
      // Set session state
      setSessionId(sessionIdFromUrl);
      setRole(role);
      setSessionState({
        code: '',
        testCases: [],
        problemStatement: '',
      });
      
      return;
    }
    
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setSessionError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error);
      setSessionError('Could not connect to the server. Using fallback mode.');
      
      // If we're in a session URL, simulate a session state
      if (sessionIdFromUrl) {
        console.log('Simulating session state for URL session:', sessionIdFromUrl);
        
        // Determine role based on URL
        const isInterviewer = path.includes('/interview/');
        const role = isInterviewer ? 'interviewer' : 'interviewee';
        
        // Set session state
        setSessionId(sessionIdFromUrl);
        setRole(role);
        setSessionState({
          code: '',
          testCases: [],
          problemStatement: '',
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('session_error', (error) => {
      console.log('Session error received:', error);
      setSessionError(error.message);
      setSessionId(null);
      setRole(null);
      setPendingSessionId(null);
      setPendingRole(null);
      setSessionState(null);
    });

    newSocket.on('session_state', (state) => {
      console.log('Session state received:', state);
      setSessionId(state.sessionId);
      setRole(state.role);
      setPendingSessionId(null);
      setPendingRole(null);
      
      // Store the session state
      setSessionState({
        code: state.code || '',
        testCases: state.testCases || [],
        problemStatement: state.problemStatement || '',
      });
    });

    // Listen for real-time updates
    newSocket.on('code_updated', (data) => {
      console.log('Code update received in context:', data);
      setSessionState(prev => prev ? { ...prev, code: data.code } : null);
    });

    newSocket.on('test_cases_updated', (data) => {
      console.log('Test cases update received in context:', data);
      setSessionState(prev => prev ? { ...prev, testCases: data.testCases } : null);
    });

    newSocket.on('problem_statement_updated', (data) => {
      console.log('Problem statement update received in context:', data);
      setSessionState(prev => prev ? { ...prev, problemStatement: data.problemStatement } : null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join a session
  const joinSession = (sessionId: string, role: 'interviewer' | 'interviewee') => {
    if (socket) {
      console.log(`Joining session: ${sessionId} as ${role}`);
      setSessionError(null);
      setPendingSessionId(sessionId);
      setPendingRole(role);
      socket.emit('join_session', { sessionId, role });
    } else {
      // If WebSocket is not available, simulate joining the session
      console.log(`Simulating join session: ${sessionId} as ${role}`);
      setSessionError(null);
      setSessionId(sessionId);
      setRole(role);
      setSessionState({
        code: '',
        testCases: [],
        problemStatement: '',
      });
    }
  };

  // Leave the current session
  const leaveSession = (sessionId: string) => {
    if (socket) {
      console.log(`Leaving session: ${sessionId}`);
      socket.emit('leave_session', { sessionId });
      setSessionId(null);
      setRole(null);
      setPendingSessionId(null);
      setPendingRole(null);
    }
  };

  // Clear session error
  const clearSessionError = () => {
    setSessionError(null);
  };

  // Send code updates
  const sendCodeUpdate = (sessionId: string, code: string) => {
    if (socket) {
      socket.emit('code_change', { sessionId, code });
    }
  };

  // Send test case updates
  const sendTestCaseUpdate = (sessionId: string, testCases: TestCase[]) => {
    if (socket) {
      socket.emit('test_case_change', { sessionId, testCases });
    }
  };

  // Send problem statement updates
  const sendProblemStatementUpdate = (sessionId: string, problemStatement: string) => {
    if (socket) {
      socket.emit('problem_statement_change', { sessionId, problemStatement });
    }
  };

  // Context value
  const value = {
    socket,
    isConnected,
    sessionId,
    role,
    sessionError,
    sessionState,
    joinSession,
    leaveSession,
    sendCodeUpdate,
    sendTestCaseUpdate,
    sendProblemStatementUpdate,
    clearSessionError,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext; 