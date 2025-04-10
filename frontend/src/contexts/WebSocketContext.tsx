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
const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Custom hook to use the WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// WebSocket provider component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [role, setRole] = useState<'interviewer' | 'interviewee' | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<{
    code: string;
    testCases: TestCase[];
    problemStatement: string;
  } | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      setSessionError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setSessionError('Could not connect to the server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    newSocket.on('session_error', (error) => {
      console.error('Session error:', error);
      setSessionError(error.message);
    });

    newSocket.on('session_state', (state) => {
      console.log('Session state received:', state);
      setSessionId(state.sessionId);
      setRole(state.role);
      setSessionState({
        code: state.code || '',
        testCases: state.testCases || [],
        problemStatement: state.problemStatement || '',
      });
    });

    newSocket.on('code_updated', (data) => {
      console.log('Code update received:', data);
      setSessionState(prev => prev ? {
        ...prev,
        code: data.code
      } : null);
    });

    newSocket.on('test_cases_updated', (data) => {
      console.log('Test cases update received:', data);
      setSessionState(prev => prev ? {
        ...prev,
        testCases: data.testCases
      } : null);
    });

    newSocket.on('problem_statement_updated', (data) => {
      console.log('Problem statement update received:', data);
      setSessionState(prev => prev ? {
        ...prev,
        problemStatement: data.problemStatement
      } : null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join a session
  const joinSession = (sessionId: string, role: 'interviewer' | 'interviewee') => {
    if (!socket) return;
    console.log(`Joining session ${sessionId} as ${role}`);
    socket.emit('join_session', { sessionId, role });
  };

  // Leave the current session
  const leaveSession = (sessionId: string) => {
    if (!socket) return;
    console.log(`Leaving session ${sessionId}`);
    socket.emit('leave_session', { sessionId });
    setSessionId(null);
    setRole(null);
    setSessionState(null);
  };

  // Clear session error
  const clearSessionError = () => {
    setSessionError(null);
  };

  // Send code updates
  const sendCodeUpdate = (sessionId: string, code: string) => {
    if (!socket || !isConnected) {
      console.error('Cannot send code update: Socket not connected');
      return;
    }
    console.log('Sending code update:', { sessionId, code: code.substring(0, 50) + '...' });
    socket.emit('code_change', { sessionId, code });
  };

  // Send test case updates
  const sendTestCaseUpdate = (sessionId: string, testCases: TestCase[]) => {
    if (!socket || !isConnected) {
      console.error('Cannot send test case update: Socket not connected');
      return;
    }
    console.log('Sending test case update:', { sessionId, testCases });
    socket.emit('test_case_change', { sessionId, testCases });
  };

  // Send problem statement updates
  const sendProblemStatementUpdate = (sessionId: string, problemStatement: string) => {
    if (!socket || !isConnected) {
      console.error('Cannot send problem statement update: Socket not connected');
      return;
    }
    console.log('Sending problem statement update:', { sessionId, problemStatement });
    socket.emit('problem_statement_change', { sessionId, problemStatement });
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