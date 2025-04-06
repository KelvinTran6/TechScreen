import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, CssBaseline, Snackbar, Alert, Paper, Typography, Switch, FormControlLabel } from '@mui/material';
import ProblemDescription from './components/ProblemDescription';
import CodeEditor from './components/CodeEditor';
import TestResults from './components/TestResults';
import ProblemTemplate from './components/ProblemTemplate';
import { TestCase, TestResult, Parameter } from './types';
import axios from 'axios';

function App() {
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
  const [isInterviewer, setIsInterviewer] = useState(false);
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

  const runCode = async () => {
    console.log('Running code:', code);
    console.log('Test cases:', testCases);
    
    if (testCases.length === 0) {
      setError('Please add at least one test case');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Convert test cases to proper JSON format
      const processedTestCases = testCases.map(testCase => ({
        ...testCase,
        inputs: testCase.inputs.map(input => {
          if (input === null) return null;
          try {
            // If it's already a number or boolean, return as is
            if (typeof input === 'number' || typeof input === 'boolean') return input;
            
            // Try to parse as JSON first (for arrays, objects)
            try {
              return JSON.parse(input);
            } catch {
              // If it's not valid JSON, try to parse as number
              const num = Number(input);
              if (!isNaN(num)) return num;
              
              // If not a number, return as string with quotes removed
              return input.replace(/^["'](.*)["']$/, '$1');
            }
          } catch {
            return input;
          }
        }),
        output: testCase.output === null ? null : (() => {
          try {
            // If it's already a number or boolean, return as is
            if (typeof testCase.output === 'number' || typeof testCase.output === 'boolean') 
              return testCase.output;
            
            // Try to parse as JSON first (for arrays, objects)
            try {
              return JSON.parse(testCase.output);
            } catch {
              // If it's not valid JSON, try to parse as number
              const num = Number(testCase.output);
              if (!isNaN(num)) return num;
              
              // If not a number, return as string with quotes removed
              return testCase.output.replace(/^["'](.*)["']$/, '$1');
            }
          } catch {
            return testCase.output;
          }
        })()
      }));

      // Send code execution request
      console.log('Processed test cases:', processedTestCases);
      const response = await axios.post('http://localhost:5000/execute', {
        code,
        testCases: processedTestCases
      });
      console.log('Response:', response.data);
      setTestResults(response.data.results);
    } catch (err: any) {
      console.error('Full error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.details) {
        setError(`Error: ${err.response.data.details}`);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Error executing code. Please check your code and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeystrokesLog = async (keystrokes: any[]) => {
    try {
      const keystrokeData = {
        session_id: "human_1",
        keystrokes: keystrokes,
        code: code, // Include the code that was submitted
        timestamp: new Date().toISOString()
      };
      
      // Send keystroke data to the logging service
      await axios.post('http://localhost:5001/log_keystrokes', keystrokeData);
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
      <Box sx={{ 
        bgcolor: '#2D2D2D', 
        color: 'white', 
        py: 1.5, 
        borderBottom: '1px solid #404040',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3
      }}>
        <Typography 
          variant="h6" 
          component="h1" 
          sx={{ 
            fontSize: '1.1rem',
            fontWeight: 400,
            fontFamily: 'Consolas, Monaco, monospace'
          }}
        >
          Python Coding Environment
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isInterviewer}
              onChange={(e) => setIsInterviewer(e.target.checked)}
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
      </Box>
      <Box
       sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden',
        gap: 1,
        p: 1,
        bgcolor: '#1E1E1E'
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
              onRunCode={runCode}
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
}

export default App;
