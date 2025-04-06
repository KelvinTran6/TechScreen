import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Grid, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';
import BugReportIcon from '@mui/icons-material/BugReport';
import GroupIcon from '@mui/icons-material/Group';
import Navbar from './Navbar';
import { useWebSocket } from '../contexts/WebSocketContext';

// Define the session state type
interface SessionState {
  sessionId: string;
  role: 'interviewer' | 'interviewee';
  code: string;
  testCases: any[];
  problemStatement: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    joinSession, 
    isConnected, 
    sessionError, 
    clearSessionError, 
    socket,
    sendCodeUpdate,
    sendTestCaseUpdate,
    sendProblemStatementUpdate
  } = useWebSocket();
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionId, setNewSessionId] = useState<string | null>(null);

  // Default code template for new sessions
  const defaultCode = `def solve(nums: List[int]) -> int:
    # Your code here
    pass`;

  // Default problem statement for new sessions
  const defaultProblemStatement = `Given an array of integers nums, find the maximum sum of any contiguous subarray.

Example:
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.`;

  // Listen for session state event
  useEffect(() => {
    if (!socket || !newSessionId) return;
    
    const handleSessionState = (state: SessionState) => {
      console.log('Session state received in LandingPage:', state);
      // Only navigate if this is the session we're creating
      if (state.sessionId === newSessionId) {
        // If we're the interviewer, send the initial state to the backend
        if (state.role === 'interviewer') {
          console.log('Sending initial state to backend');
          // Send initial code
          sendCodeUpdate(newSessionId, defaultCode);
          // Send initial problem statement
          sendProblemStatementUpdate(newSessionId, defaultProblemStatement);
        }
        navigate(`/session/${newSessionId}`);
        setIsCreating(false);
      }
    };
    
    const handleSessionError = () => {
      // Reset creating state when an error occurs
      setIsCreating(false);
      setNewSessionId(null);
      // Show error in the dialog if it's open
      if (isJoinDialogOpen) {
        setError(sessionError || 'Invalid session ID. Please check and try again.');
      }
    };
    
    socket.on('session_state', handleSessionState);
    socket.on('session_error', handleSessionError);
    
    return () => {
      socket.off('session_state', handleSessionState);
      socket.off('session_error', handleSessionError);
    };
  }, [socket, newSessionId, navigate, sendCodeUpdate, sendProblemStatementUpdate, isJoinDialogOpen, sessionError]);

  // Reset creating state when session error changes
  useEffect(() => {
    if (sessionError) {
      setIsCreating(false);
      setNewSessionId(null);
      // Show error in the dialog if it's open
      if (isJoinDialogOpen) {
        setError(sessionError);
      }
    }
  }, [sessionError, isJoinDialogOpen]);

  const handleCreateRoom = () => {
    // Generate a random session ID
    const generatedSessionId = `session-${Math.random().toString(36).substring(2, 9)}`;
    setNewSessionId(generatedSessionId);
    setIsCreating(true);
    
    // Join the session as interviewer
    joinSession(generatedSessionId, 'interviewer');
  };

  const handleJoinRoom = () => {
    setIsJoinDialogOpen(true);
  };

  const handleCloseJoinDialog = () => {
    setIsJoinDialogOpen(false);
    setSessionIdInput('');
    setError(null);
    clearSessionError();
  };

  const handleSessionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSessionIdInput(e.target.value);
    setError(null);
  };

  const handleJoinSession = () => {
    if (!sessionIdInput.trim()) {
      setError('Please enter a session ID');
      return;
    }
    
    // Clear any previous errors
    setError(null);
    clearSessionError();
    
    // Set the new session ID and creating state
    setNewSessionId(sessionIdInput.trim());
    setIsCreating(true);
    
    // Join the session as interviewee
    joinSession(sessionIdInput.trim(), 'interviewee');
    
    // Don't close the dialog yet - wait for success or error
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1E1E1E',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8, flex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #4CAF50 30%, #2196F3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            TechScreen
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, color: '#CCCCCC' }}>
            Real-time collaborative coding interviews made simple
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!isConnected && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Not connected to server. Please check your connection.
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="medium"
                onClick={handleCreateRoom}
                disabled={!isConnected || isCreating}
                sx={{
                  bgcolor: '#4CAF50',
                  '&:hover': {
                    bgcolor: '#3E8E41',
                  },
                  minWidth: '120px',
                }}
              >
                {isCreating ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Creating...
                  </Box>
                ) : (
                  'Create Room'
                )}
              </Button>
              
              <Button 
                variant="outlined" 
                color="primary" 
                size="medium"
                onClick={handleJoinRoom}
                disabled={!isConnected || isCreating}
                sx={{
                  color: '#FFFFFF',
                  borderColor: '#4CAF50',
                  '&:hover': {
                    borderColor: '#3E8E41',
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                  },
                  minWidth: '120px',
                }}
              >
                Join Room
              </Button>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 4, textAlign: 'center', color: '#FFFFFF' }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: '#2D2D2D',
                border: '1px solid #404040',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              <CodeIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                Real-Time Code Execution
              </Typography>
              <Typography variant="body2" sx={{ color: '#CCCCCC' }}>
                Write and test your code in real-time with instant feedback and results.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: '#2D2D2D',
                border: '1px solid #404040',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              <BugReportIcon sx={{ fontSize: 40, color: '#2196F3', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                Test Case Management
              </Typography>
              <Typography variant="body2" sx={{ color: '#CCCCCC' }}>
                Create, edit, and manage test cases with a user-friendly interface.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: '#2D2D2D',
                border: '1px solid #404040',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              <GroupIcon sx={{ fontSize: 40, color: '#9C27B0', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                Real-Time Collaboration
              </Typography>
              <Typography variant="body2" sx={{ color: '#CCCCCC' }}>
                Work together with interviewers in real-time, sharing code and test cases instantly.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#252526',
          borderTop: '1px solid #404040',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" sx={{ color: '#CCCCCC' }} align="center">
            © {new Date().getFullYear()} TechScreen. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Join Session Dialog */}
      <Dialog open={isJoinDialogOpen} onClose={handleCloseJoinDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#252526', color: '#FFFFFF', borderBottom: '1px solid #404040' }}>
          Join Interview Session
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1E1E1E', pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="Session ID"
              value={sessionIdInput}
              onChange={handleSessionIdChange}
              placeholder="Enter session ID"
              fullWidth
              error={!!error}
              helperText={error}
              disabled={isCreating}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': {
                    borderColor: '#404040',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#CCCCCC',
                },
                '& .MuiFormHelperText-root': {
                  color: '#FF6B6B',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#252526', borderTop: '1px solid #404040', p: 2 }}>
          <Button 
            onClick={handleCloseJoinDialog}
            sx={{ color: '#CCCCCC' }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleJoinSession} 
            variant="contained" 
            color="primary"
            disabled={!isConnected || isCreating || !sessionIdInput.trim()}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': {
                bgcolor: '#3E8E41',
              },
            }}
          >
            {isCreating ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Joining...
              </Box>
            ) : (
              'Join Session'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPage; 