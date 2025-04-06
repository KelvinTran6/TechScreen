import React from 'react';
import { Box, Typography, Button, FormControlLabel, Switch } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  isInterviewer?: boolean;
  onInterviewerChange?: (isInterviewer: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isInterviewer, onInterviewerChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleStartInterview = () => {
    navigate('/coding-environment', { state: { isInterviewer: true } });
  };

  return (
    <Box
      sx={{
        bgcolor: '#2D2D2D',
        py: 2,
        borderBottom: '1px solid #404040',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        height: '64px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        onClick={handleLogoClick}
        sx={{
          fontFamily: 'Consolas, Monaco, monospace',
          fontWeight: 600,
          color: '#4CAF50',
          fontSize: '1.25rem',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        TechScreen
      </Typography>
      
      {isLandingPage ? (
        <Button
          variant="outlined"
          color="primary"
          sx={{
            borderColor: '#4CAF50',
            color: '#4CAF50',
            '&:hover': {
              borderColor: '#4CAF50',
              bgcolor: 'rgba(76, 175, 80, 0.1)',
            },
          }}
          onClick={handleStartInterview}
        >
          Start Interview
        </Button>
      ) : (
        <FormControlLabel
          control={
            <Switch
              checked={isInterviewer}
              onChange={(e) => onInterviewerChange && onInterviewerChange(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-track': {
                  bgcolor: '#404040'
                },
                '& .MuiSwitch-thumb': {
                  bgcolor: isInterviewer ? '#4CAF50' : '#808080'
                }
              }}
            />
          }
          label="Interviewer Mode"
          sx={{ 
            color: '#CCCCCC',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace'
            }
          }}
        />
      )}
    </Box>
  );
};

export default Navbar; 