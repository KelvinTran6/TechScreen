import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  CircularProgress
} from '@mui/material';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useNavigate } from 'react-router-dom';

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { joinSession, isConnected, sessionError, clearSessionError, socket } = useWebSocket();
  
  const [sessionId, setSessionId] = useState('');
  const [role, setRole] = useState<'interviewer' | 'interviewee'>('interviewee');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  
  // Clear session error when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      clearSessionError();
      setError(null);
      setIsJoining(false);
      setPendingSessionId(null);
    }
  }, [isOpen, clearSessionError]);
  
  // Listen for session state event
  useEffect(() => {
    if (!socket) return;
    
    const handleSessionState = () => {
      if (pendingSessionId) {
        // Session was successfully joined
        navigate(`/session/${pendingSessionId}`, { 
          state: { 
            isInterviewer: role === 'interviewer'
          } 
        });
        onClose();
      }
    };
    
    const handleSessionError = () => {
      // Reset loading state when an error occurs
      setIsJoining(false);
      setPendingSessionId(null);
    };
    
    socket.on('session_state', handleSessionState);
    socket.on('session_error', handleSessionError);
    
    return () => {
      socket.off('session_state', handleSessionState);
      socket.off('session_error', handleSessionError);
    };
  }, [socket, pendingSessionId, navigate, role, onClose]);
  
  // Reset loading state when session error changes
  useEffect(() => {
    if (sessionError) {
      setIsJoining(false);
      setPendingSessionId(null);
    }
  }, [sessionError]);
  
  const handleSessionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSessionId(e.target.value);
    setError(null);
  };
  
  const handleRoleChange = (e: SelectChangeEvent) => {
    setRole(e.target.value as 'interviewer' | 'interviewee');
  };
  
  const handleCreateSession = () => {
    // Generate a random session ID if none provided
    const newSessionId = sessionId.trim() || `session-${Math.random().toString(36).substring(2, 9)}`;
    
    // Set pending session ID and joining state
    setPendingSessionId(newSessionId);
    setIsJoining(true);
    
    // Join the session
    joinSession(newSessionId, role);
  };
  
  const handleJoinSession = () => {
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }
    
    // Set pending session ID and joining state
    setPendingSessionId(sessionId.trim());
    setIsJoining(true);
    
    // Join the session
    joinSession(sessionId.trim(), role);
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Interview Session</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sessionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {sessionError}
            </Alert>
          )}
          
          <TextField
            label="Session ID"
            value={sessionId}
            onChange={handleSessionIdChange}
            placeholder="Enter session ID or leave blank to create a new one"
            fullWidth
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
            disabled={isJoining}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Role"
              onChange={handleRoleChange}
              disabled={isJoining}
            >
              <MenuItem value="interviewer">Interviewer</MenuItem>
              <MenuItem value="interviewee">Interviewee</MenuItem>
            </Select>
          </FormControl>
          
          {!isConnected && (
            <Typography color="error" sx={{ mb: 2 }}>
              Not connected to server. Please check your connection.
            </Typography>
          )}
          
          {isJoining && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>
                {pendingSessionId ? `Joining session: ${pendingSessionId}...` : 'Creating session...'}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isJoining}>Cancel</Button>
        {sessionId.trim() ? (
          <Button 
            onClick={handleJoinSession} 
            variant="contained" 
            color="primary"
            disabled={!isConnected || isJoining}
          >
            {isJoining ? 'Joining...' : 'Join Session'}
          </Button>
        ) : (
          <Button 
            onClick={handleCreateSession} 
            variant="contained" 
            color="primary"
            disabled={!isConnected || isJoining}
          >
            {isJoining ? 'Creating...' : 'Create Session'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionManager; 