import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Grid, 
  useTheme, 
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import Navbar from './Navbar';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleStartInterview = () => {
    // Navigate to the coding environment with interviewer mode enabled
    navigate('/coding-environment', { state: { isInterviewer: true } });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#1E1E1E',
        color: '#CCCCCC',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CssBaseline />
      
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        py: 8,
        mt: '64px', // Add margin to account for fixed navbar
        boxSizing: 'border-box'
      }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontFamily: 'Consolas, Monaco, monospace',
                fontWeight: 700,
                mb: 2,
                color: '#FFFFFF',
              }}
            >
              Technical Interview Platform
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                color: '#AAAAAA',
                lineHeight: 1.5,
              }}
            >
              Conduct and evaluate coding interviews with real-time code execution, test case management, and comprehensive analytics.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartInterview}
              sx={{
                bgcolor: '#4CAF50',
                '&:hover': {
                  bgcolor: '#3E8E41',
                },
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
              }}
            >
              Start Interview Mode
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#252526',
                p: 3,
                borderRadius: 1,
                border: '1px solid #404040',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem',
                color: '#CCCCCC',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ color: '#569CD6' }}>def</Box>
              <Box sx={{ color: '#DCDCAA' }}>solve</Box>
              <Box sx={{ color: '#CCCCCC' }}>(nums: List[int]) {'->'} int:</Box>
              <Box sx={{ pl: 2, color: '#CCCCCC' }}>max_sum = float('-inf')</Box>
              <Box sx={{ pl: 2, color: '#CCCCCC' }}>current_sum = 0</Box>
              <Box sx={{ pl: 2, color: '#CCCCCC' }}>for num in nums:</Box>
              <Box sx={{ pl: 4, color: '#CCCCCC' }}>current_sum = max(num, current_sum + num)</Box>
              <Box sx={{ pl: 4, color: '#CCCCCC' }}>max_sum = max(max_sum, current_sum)</Box>
              <Box sx={{ pl: 2, color: '#569CD6' }}>return</Box>
              <Box sx={{ pl: 4, color: '#CCCCCC' }}>max_sum</Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ mt: 12 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontWeight: 600,
              mb: 6,
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#252526',
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #404040',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <CodeIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF' }}>
                  Real-time Code Execution
                </Typography>
                <Typography variant="body2" sx={{ color: '#AAAAAA' }}>
                  Execute Python code in real-time with immediate feedback and results.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#252526',
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #404040',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <AssessmentIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF' }}>
                  Test Case Management
                </Typography>
                <Typography variant="body2" sx={{ color: '#AAAAAA' }}>
                  Create, edit, and manage test cases to evaluate code correctness.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#252526',
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #404040',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <SpeedIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF' }}>
                  Performance Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: '#AAAAAA' }}>
                  Track candidate performance with detailed analytics and insights.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#252526',
                  p: 3,
                  borderRadius: 1,
                  border: '1px solid #404040',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <SecurityIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF' }}>
                  Secure Environment
                </Typography>
                <Typography variant="body2" sx={{ color: '#AAAAAA' }}>
                  Conduct interviews in a secure, controlled environment with proper access controls.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#2D2D2D',
          py: 3,
          borderTop: '1px solid #404040',
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#AAAAAA',
            }}
          >
            © {new Date().getFullYear()} TechScreen. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 