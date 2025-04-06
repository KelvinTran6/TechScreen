import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Tooltip } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface NavbarProps {
  isInterviewer?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isInterviewer }) => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const isLandingPage = window.location.pathname === '/';
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleTitleClick = () => {
    navigate('/');
  };

  const handleCopySessionUrl = () => {
    if (sessionId) {
      const sessionUrl = `${window.location.origin}/session/${sessionId}`;
      navigator.clipboard.writeText(sessionUrl)
        .then(() => {
          setShowCopiedMessage(true);
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
        });
    }
  };

  const handleCloseSnackbar = () => {
    setShowCopiedMessage(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        bgcolor: '#252526',
        borderBottom: '1px solid #404040',
        height: '64px',
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <Typography
        variant="h6"
        component="div"
        sx={{
          cursor: 'pointer',
          color: '#FFFFFF',
          fontFamily: 'Consolas, Monaco, monospace',
          fontWeight: 700,
          '&:hover': {
            color: '#4CAF50',
          },
        }}
        onClick={handleTitleClick}
      >
        TechScreen
      </Typography>

      {isLandingPage ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/session/new')}
          sx={{
            bgcolor: '#4CAF50',
            '&:hover': {
              bgcolor: '#3E8E41',
            },
          }}
        >
          Start Interview
        </Button>
      ) : (
        isInterviewer && (
          <Tooltip title="Copy session URL to share with candidate">
            <Button
              variant="outlined"
              color="primary"
              onClick={handleCopySessionUrl}
              startIcon={<ContentCopyIcon />}
              sx={{
                color: '#FFFFFF',
                borderColor: '#4CAF50',
                '&:hover': {
                  borderColor: '#3E8E41',
                  backgroundColor: 'rgba(76, 175, 80, 0.08)',
                },
              }}
            >
              Copy Session URL
            </Button>
          </Tooltip>
        )
      )}

      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Session URL copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Navbar; 