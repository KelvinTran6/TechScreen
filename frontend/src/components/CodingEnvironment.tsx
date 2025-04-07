import React, { useState, useEffect, useRef } from 'react';
import { Box, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useWebSocket } from '../contexts/WebSocketContext';
import Navbar from './Navbar';
import ProblemDescription from './ProblemDescription';
import CodeEditor from './CodeEditor';
import TestResults from './TestResults';
import ProblemTemplate from './ProblemTemplate';
import { TestCase, TestResult, Parameter } from '../types';

interface CodingEnvironmentProps {
  isInterviewer: boolean;
  sessionId: string;
}

const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({
  isInterviewer,
  sessionId
}) => {
  const { 
    socket, 
    sessionId: socketSessionId, 
    sessionState,
    sendCodeUpdate,
    sendTestCaseUpdate,
    sendProblemStatementUpdate
  } = useWebSocket();
  const [code, setCode] = useState<string>('');
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
  const testResultsRef = useRef<{ handleUpdateTestUI: (params: Parameter[], returnType: string) => void; } | null>(null);
  const [problemStatement, setProblemStatement] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerHeight - 64);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current && !isVerticalResizing.current) return;
      
      e.preventDefault();
      
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

  useEffect(() => {
    if (sessionState && !isInitialized) {
      console.log('Initializing state from session state:', sessionState);
      
      if (sessionState.code) {
        setCode(sessionState.code);
      } else if (isInterviewer) {
        // Set default code template for interviewer if no code exists
        setCode(`def solve(nums: List[int]) -> int:
    # Your code here
    pass`);
      }
      
      if (sessionState.testCases && sessionState.testCases.length > 0) {
        setTestCases(sessionState.testCases);
      }
      
      if (sessionState.problemStatement) {
        setProblemStatement(sessionState.problemStatement);
      } else if (isInterviewer) {
        // Set default problem statement for interviewer if none exists
        setProblemStatement(`Given an array of integers nums, find the maximum sum of any contiguous subarray.

Example:
Input: [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.`);
      }
      
      setIsInitialized(true);
    }
  }, [sessionState, isInterviewer, isInitialized]);

  useEffect(() => {
    if (sessionState) {
      console.log('Session state updated:', sessionState);
      
      if (sessionState.code) {
        setCode(sessionState.code);
      }
      
      if (sessionState.testCases && sessionState.testCases.length > 0) {
        setTestCases(sessionState.testCases);
      }
      
      if (sessionState.problemStatement) {
        setProblemStatement(sessionState.problemStatement);
      }
    }
  }, [sessionState]);

  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = (data: { code: string }) => {
      setCode(data.code);
    };

    const handleTestCaseUpdate = (data: { testCases: TestCase[] }) => {
      setTestCases(data.testCases);
    };

    const handleProblemStatementUpdate = (data: { problemStatement: string }) => {
      setProblemStatement(data.problemStatement);
    };

    socket.on('code_updated', handleCodeUpdate);
    socket.on('test_cases_updated', handleTestCaseUpdate);
    socket.on('problem_statement_updated', handleProblemStatementUpdate);

    return () => {
      socket.off('code_updated', handleCodeUpdate);
      socket.off('test_cases_updated', handleTestCaseUpdate);
      socket.off('problem_statement_updated', handleProblemStatementUpdate);
    };
  }, [socket]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = descriptionWidth;
  };

  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isVerticalResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = parseInt(codeEditorHeight);
  };

  const handleAddTestCase = (testCase: TestCase) => {
    const newTestCases = [...testCases, testCase];
    setTestCases(newTestCases);
    sendTestCaseUpdate(sessionId, newTestCases);
  };

  const handleUpdateTestCase = (index: number, testCase: TestCase) => {
    const newTestCases = [...testCases];
    newTestCases[index] = testCase;
    setTestCases(newTestCases);
    sendTestCaseUpdate(sessionId, newTestCases);
  };

  const handleDeleteTestCase = (index: number) => {
    const newTestCases = [...testCases];
    newTestCases.splice(index, 1);
    setTestCases(newTestCases);
    sendTestCaseUpdate(sessionId, newTestCases);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      sendCodeUpdate(sessionId, value);
    }
  };

  const executeCode = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/execute`, {
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
    }
  };

  const checkForCheating = async () => {
    try {
      const url = `${process.env.REACT_APP_CHEAT_DETECTION_URL || 'http://localhost:5001'}/check-code`;
      console.log('Making request to:', url);
      console.log('With payload:', {
        problem_statement: problemStatement || 'Default problem statement',
        candidate_code: code || '',
        language: 'python'
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          problem_statement: problemStatement || 'Default problem statement',
          candidate_code: code || '',
          language: 'python'
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (err) {
      console.error('Error checking code for cheating:', err);
      throw err;
    }
  };

  const handleRunCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await executeCode();
      const cheatResult = await checkForCheating();
      console.log('Cheat detection result:', cheatResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
      bgcolor: '#1E1E1E'
    }}>
      <CssBaseline />
      <Navbar 
        isInterviewer={isInterviewer}
      />
      <Box
        sx={{ 
          display: 'flex', 
          flex: 1,
          overflow: 'hidden',
          gap: 1,
          p: 1,
          bgcolor: '#1E1E1E',
          height: 'calc(100vh - 64px)',
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
                onUpdateProblem={(newStatement) => {
                  setProblemStatement(newStatement);
                  sendProblemStatementUpdate(sessionId, newStatement);
                }}
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

export default CodingEnvironment; 