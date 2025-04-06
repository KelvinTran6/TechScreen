import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, CssBaseline, Snackbar, Alert, Paper, Typography, Switch, FormControlLabel } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ProblemDescription from './components/ProblemDescription';
import CodeEditor from './components/CodeEditor';
import TestResults from './components/TestResults';
import ProblemTemplate from './components/ProblemTemplate';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import { TestCase, TestResult, Parameter } from './types';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const LOGGING_URL = process.env.REACT_APP_LOGGING_URL || 'http://localhost:5001';
const ENABLE_LOGGING = process.env.REACT_APP_ENABLE_LOGGING === 'true';

// Coding Environment Component
const CodingEnvironment: React.FC = () => {
  const location = useLocation();
  const [code, setCode] = useState<string>(`def solve(nums: List[int]) -> int:
    # Your code here
    pass`);
  
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight - 64);
  const [descriptionWidth, setDescriptionWidth] = useState(400);
  const [codeEditorHeight, setCodeEditorHeight] = useState('50%');
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const isVerticalResizing = useRef(false);
  const [isInterviewer, setIsInterviewer] = useState(location.state?.isInterviewer || false);
  const testResultsRef = useRef<{ handleUpdateTestUI: (params: Parameter[], returnType: string) => void; } | null>(null);
  const [problemStatement, setProblemStatement] = useState<string>(`Given an array of integers nums, find the maximum sum of any contiguous subarray.

Example:
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.`);

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerHeight - 64);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current && !isVerticalResizing.current) return;
      
      e.preventDefault(); // Prevent text selection during drag
      
      if (isVerticalResizing.current) {
        const delta = e.clientY - startY.current;
        const newHeight = Math.max(startHeight.current + delta, 100);
        setCodeEditorHeight(`${newHeight}px`);
      } else {
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(startWidth.current + delta, 300);
        setDescriptionWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      isVerticalResizing.current = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = descriptionWidth;
  };

  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    isVerticalResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = parseInt(codeEditorHeight);
  };

  const handleAddTestCase = (testCase: TestCase) => {
    setTestCases(prev => [...prev, testCase]);
  };

  const handleUpdateTestCase = (index: number, testCase: TestCase) => {
    setTestCases(prev => {
      const newTestCases = [...prev];
      newTestCases[index] = testCase;
      return newTestCases;
    });
  };

  const handleDeleteTestCase = (index: number) => {
    setTestCases(prev => {
      const newTestCases = [...prev];
      newTestCases.splice(index, 1);
      return newTestCases;
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleRunCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          testCases,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTestResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeystrokesLog = async (keystrokes: any[]) => {
    // Skip logging if disabled
    if (!ENABLE_LOGGING) {
      return;
    }
    
    try {
      const keystrokeData = {
        session_id: "human_1",
        keystrokes: keystrokes,
        code: code,
        timestamp: new Date().toISOString()
      };
      
      // Send keystroke data to the logging service
      await axios.post(`${LOGGING_URL}/log_keystrokes`, keystrokeData);
      console.log('Keystrokes logged successfully');
    } catch (error) {
      console.error('Error logging keystrokes:', error);
      // Don't block code execution if keystroke logging fails
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: '#1E1E1E'  // Dark theme background
    }}>
      <CssBaseline />
      <Navbar 
        isInterviewer={isInterviewer} 
        onInterviewerChange={setIsInterviewer} 
      />
      <Box
       sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden',
        gap: 1,
        p: 1,
        bgcolor: '#1E1E1E',
        height: 'calc(100vh - 64px)', // Subtract navbar height
        boxSizing: 'border-box'
      }}>
        <Box
         sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <Box sx={{ 
            width: descriptionWidth,
            flex: 1,
            position: 'relative',
            backgroundColor: '#252526',
            zIndex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #404040',
          }}>
            <Box
              onMouseDown={handleMouseDown}
              sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                cursor: 'col-resize',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: '#404040'
                },
              }}
            />
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <ProblemDescription
                problemStatement={problemStatement}
                isInterviewer={isInterviewer}
                onUpdateProblem={setProblemStatement}
              />
              {isInterviewer && (
                <ProblemTemplate
                  code={code}
                  onUpdateTestUI={(params, returnType) => {
                    if (testResultsRef.current) {
                      testResultsRef.current.handleUpdateTestUI(params, returnType);
                    }
                  }}
                  onError={(message) => setError(message)}
                />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          overflow: 'hidden',
          minWidth: 300,
          flex: '1 1 0%'
        }}>
          <Box sx={{ 
            height: codeEditorHeight,
            overflow: 'hidden',
            border: '1px solid #404040',
            position: 'relative',
            bgcolor: '#252526'
          }}>
            <Box
              onMouseDown={handleVerticalMouseDown}
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '4px',
                cursor: 'row-resize',
                backgroundColor: 'transparent',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: '#404040'
                }
              }}
            />
            <CodeEditor
              code={code}
              onCodeChange={handleCodeChange}
              onRunCode={handleRunCode}
              loading={loading}
              onKeystrokesLog={handleKeystrokesLog}
            />
          </Box>
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden',
            border: '1px solid #404040',
            bgcolor: '#252526'
          }}>
            <TestResults 
              ref={testResultsRef}
              testCases={testCases}
              results={testResults}
              onAddTestCase={handleAddTestCase}
              onUpdateTestCase={handleUpdateTestCase}
              onDeleteTestCase={handleDeleteTestCase}
              loading={loading}
              isInterviewer={isInterviewer}
            />
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            bgcolor: '#2D2D2D',
            color: '#FF6B6B',
            '& .MuiAlert-icon': {
              color: '#FF6B6B'
            }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/coding-environment" element={<CodingEnvironment />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
