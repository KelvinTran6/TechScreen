import React, { useState, useEffect, useRef } from 'react';
import { Box, CssBaseline, Snackbar, Alert } from '@mui/material';
import { useWebSocket } from '../contexts/WebSocketContext';
import Navbar from './Navbar';
import ProblemDescription from './ProblemDescription';
import CodeEditor from './CodeEditor';
import TestResults from './TestResults';
import CandidateActivityOverlay from './CandidateActivityOverlay';
import { TestCase, TestResult, Parameter } from '../types';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { 
  codeAtom, 
  testCasesAtom, 
  testResultsAtom, 
  problemStatementAtom, 
  candidateActivitiesAtom,
  loadingAtom,
  errorAtom,
  containerHeightAtom,
  descriptionWidthAtom,
  codeEditorHeightAtom
} from '../recoil';

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
    sessionState,
    sendCodeUpdate,
    sendProblemStatementUpdate,
    sendCandidateActivity
  } = useWebSocket();
  
  // Replace local state with Recoil atoms
  const [code, setCode] = useRecoilState(codeAtom);
  const [testCases, setTestCases] = useRecoilState(testCasesAtom);
  const [testResults, setTestResults] = useRecoilState(testResultsAtom);
  const [problemStatement, setProblemStatement] = useRecoilState(problemStatementAtom);
  const [candidateActivities, setCandidateActivities] = useRecoilState(candidateActivitiesAtom);
  const [loading, setLoading] = useRecoilState(loadingAtom);
  const [error, setError] = useRecoilState(errorAtom);
  const [containerHeight, setContainerHeight] = useRecoilState(containerHeightAtom);
  const [descriptionWidth, setDescriptionWidth] = useRecoilState(descriptionWidthAtom);
  const [codeEditorHeight, setCodeEditorHeight] = useRecoilState(codeEditorHeightAtom);
  
  // Keep other local state that doesn't need to be shared
  const [isInitialized, setIsInitialized] = useState(false);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const startY = useRef(0);
  const startHeight = useRef(0);
  const isVerticalResizing = useRef(false);
  const testResultsRef = useRef<{ handleUpdateTestUI: (params: Parameter[], returnType: string) => void; } | null>(null);
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define key combinations to highlight
  const highlightedKeyCombos: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }> = [
    { key: 'b', ctrlKey: true },
    { key: 'Enter', ctrlKey: true },
    { key: 'h', ctrlKey: true },
    { key: 'g', ctrlKey: true },
    { key: 'F4', altKey: true },
    { key: 'ArrowUp', ctrlKey: true },
    { key: 'ArrowDown', ctrlKey: true },
    { key: 'ArrowLeft', ctrlKey: true },
    { key: 'ArrowRight', ctrlKey: true },
    { key: 'a', ctrlKey: true }, // Ctrl+A (Select All)
    { key: 'c', ctrlKey: true }, // Ctrl+C (Copy)
    { key: 'v', ctrlKey: true }, // Ctrl+V (Paste)
    { key: 'x', ctrlKey: true }, // Ctrl+X (Cut)
    { key: 'z', ctrlKey: true }, // Ctrl+Z (Undo)
    { key: 'y', ctrlKey: true }, // Ctrl+Y (Redo)
    { key: 'f', ctrlKey: true }, // Ctrl+F (Find)
    { key: 'p', ctrlKey: true }, // Ctrl+P (Print)
    { key: 's', ctrlKey: true }, // Ctrl+S (Save)
    { key: 'r', ctrlKey: true }, // Ctrl+R (Refresh)
    { key: 'l', ctrlKey: true }, // Ctrl+L (Focus URL bar)
    { key: 't', ctrlKey: true }, // Ctrl+T (New tab)
    { key: 'w', ctrlKey: true }, // Ctrl+W (Close tab)
    { key: 'Tab', ctrlKey: true }, // Ctrl+Tab (Switch tabs)
    { key: 'Home', ctrlKey: true }, // Ctrl+Home (Go to beginning)
    { key: 'End', ctrlKey: true }, // Ctrl+End (Go to end)
    { key: 'PageUp', ctrlKey: true }, // Ctrl+PageUp (Previous tab)
    { key: 'PageDown', ctrlKey: true }, // Ctrl+PageDown (Next tab)
    { key: 'Insert', ctrlKey: true }, // Ctrl+Insert (Copy)
    { key: 'Delete', ctrlKey: true }, // Ctrl+Delete (Delete word)
    { key: 'Backspace', ctrlKey: true }, // Ctrl+Backspace (Delete word)
  ];

  // Add keyboard event listener for non-interviewers
  useEffect(() => {
    if (!isInterviewer && socket) {
      // Create a debounce map to track recently sent key combinations
      const recentlySentKeys = new Map<string, number>();
      const DEBOUNCE_TIME = 300; // milliseconds
      
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Alt:', e.altKey, 'Shift:', e.shiftKey, 'Meta:', e.metaKey);
        
        // Check if this is a highlighted key combination
        const isHighlighted = highlightedKeyCombos.some(combo => 
          combo.key.toLowerCase() === e.key.toLowerCase() && 
          (combo.ctrlKey === undefined || combo.ctrlKey === e.ctrlKey) &&
          (combo.altKey === undefined || combo.altKey === e.altKey) &&
          (combo.shiftKey === undefined || combo.shiftKey === e.shiftKey) &&
          (combo.metaKey === undefined || combo.metaKey === e.metaKey)
        );
        
        // Skip regular typing (single character keys without modifiers)
        const isRegularTyping = e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey;
        
        // Only send special keys or keyboard shortcuts
        if (!isRegularTyping || isHighlighted) {
          // For highlighted key combinations, prevent the default behavior
          if (isHighlighted) {
            e.preventDefault();
            console.log('Prevented default behavior for key combination:', e.key, 'Ctrl:', e.ctrlKey);
          }
          
          // Create a unique key for this combination
          const keyCombo = `${e.key}-${e.ctrlKey ? 'ctrl' : ''}-${e.altKey ? 'alt' : ''}-${e.shiftKey ? 'shift' : ''}-${e.metaKey ? 'meta' : ''}`;
          
          // Check if this key combination was recently sent
          const lastSentTime = recentlySentKeys.get(keyCombo);
          const currentTime = Date.now();
          
          if (!lastSentTime || currentTime - lastSentTime > DEBOUNCE_TIME) {
            // Update the last sent time
            recentlySentKeys.set(keyCombo, currentTime);
            
            // Send keystroke to interviewer through socket
            socket.emit('candidate_activity', {
              sessionId,
              type: 'keypress',
              key: e.key,
              ctrlKey: e.ctrlKey,
              altKey: e.altKey,
              shiftKey: e.shiftKey,
              metaKey: e.metaKey,
              isHighlighted,
              timestamp: new Date().toISOString()
            });
            
            console.log('Sent key combination:', keyCombo);
          } else {
            console.log('Debounced key combination:', keyCombo);
          }
        }
      };

      // Add event listeners at multiple levels with highest priority
      // 1. Window level with capture phase
      window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
      
      // 2. Document level with capture phase
      document.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
      
      // 3. Document body with capture phase
      document.body.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });

      const handleMouseClick = (e: MouseEvent) => {
        console.log('Mouse clicked:', {
          x: e.clientX,
          y: e.clientY,
          button: e.button,
          target: (e.target as HTMLElement).tagName
        });
        // Send mouse click to interviewer through socket
        socket.emit('candidate_activity', {
          sessionId,
          type: 'mouseclick',
          x: e.clientX,
          y: e.clientY,
          button: e.button,
          target: (e.target as HTMLElement).tagName,
          timestamp: new Date().toISOString()
        });
      };

      // Add event listeners
      window.addEventListener('click', handleMouseClick);

      // Clean up event listeners
      return () => {
        window.removeEventListener('keydown', handleKeyDown, { capture: true });
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
        document.body.removeEventListener('keydown', handleKeyDown, { capture: true });
        window.removeEventListener('click', handleMouseClick);
      };
    }
  }, [isInterviewer, socket, sessionId, highlightedKeyCombos]);

  // Add socket listener for candidate activity (interviewer only)
  useEffect(() => {
    if (isInterviewer && socket) {
      console.log('Setting up candidate activity listener for interviewer');
      
      const handleCandidateActivity = (data: any) => {
        console.log('Received candidate activity data:', data);
        
        // Check if the activity is for this session
        // If sessionId is missing, assume it's for the current session
        if (!data.sessionId || data.sessionId === sessionId) {
          console.log('Activity matches current session:', sessionId);
          
          if (data.type === 'keypress') {
            console.log(`Candidate pressed key: ${data.key} at ${new Date(data.timestamp).toLocaleTimeString()}`);
            
            // Add the activity to the state
            const activityId = `key-${Date.now()}`;
            setCandidateActivities(prev => {
              // Keep only the 5 most recent activities
              const recentActivities = prev.slice(-4); // Keep 4 to make room for the new one
              
              return [...recentActivities, {
                id: activityId,
                type: 'keypress',
                key: data.key,
                ctrlKey: data.ctrlKey,
                altKey: data.altKey,
                shiftKey: data.shiftKey,
                metaKey: data.metaKey,
                isHighlighted: data.isHighlighted,
                timestamp: data.timestamp
              }];
            });
            
            // Reset the global timer whenever a new activity is added
            if (globalTimerRef.current) {
              clearTimeout(globalTimerRef.current);
            }
            
            // Set a new global timer to clear all activities after 2 seconds
            globalTimerRef.current = setTimeout(() => {
              setCandidateActivities([]);
            }, 2000);
            
          } else if (data.type === 'mouseclick') {
            console.log(`Candidate clicked at (${data.x}, ${data.y}) on element ${data.target} at ${new Date(data.timestamp).toLocaleTimeString()}`);
            
            // Add the activity to the state
            const activityId = `mouse-${Date.now()}`;
            setCandidateActivities(prev => {
              // Keep only the 5 most recent activities
              const recentActivities = prev.slice(-4); // Keep 4 to make room for the new one
              
              return [...recentActivities, {
                id: activityId,
                type: 'mouseclick',
                x: data.x,
                y: data.y,
                target: data.target,
                button: data.button,
                timestamp: data.timestamp
              }];
            });
            
            // Reset the global timer whenever a new activity is added
            if (globalTimerRef.current) {
              clearTimeout(globalTimerRef.current);
            }
            
            // Set a new global timer to clear all activities after 2 seconds
            globalTimerRef.current = setTimeout(() => {
              setCandidateActivities([]);
            }, 2000);
            
          } else {
            console.log('Unknown activity type:', data.type);
          }
        } else {
          console.log('Activity for different session:', data.sessionId, 'current session:', sessionId);
        }
      };

      socket.on('candidate_activity', handleCandidateActivity);
      console.log('Candidate activity listener registered');

      return () => {
        socket.off('candidate_activity', handleCandidateActivity);
        console.log('Candidate activity listener removed');
        // Clear the global timer when the component unmounts
        if (globalTimerRef.current) {
          clearTimeout(globalTimerRef.current);
        }
      };
    }
  }, [isInterviewer, socket, sessionId]);

  useEffect(() => {
    const handleResize = () => {
      setContainerHeight(window.innerHeight - 64);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current && !isVerticalResizing.current) return;
      
      e.preventDefault();
      
      if (isVerticalResizing.current) {
        const delta = e.clientY - startY.current;
        const newHeight = Math.max(200, Math.min(window.innerHeight - 400, startHeight.current + delta));
        setCodeEditorHeight(newHeight);
      } else {
        const delta = e.clientX - startX.current;
        const newWidth = Math.max(200, Math.min(600, startWidth.current + delta));
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
  }, [setContainerHeight, setCodeEditorHeight, setDescriptionWidth]);

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

    const handleProblemStatementUpdate = (data: { problemStatement: string }) => {
      setProblemStatement(data.problemStatement);
    };

    socket.on('code_updated', handleCodeUpdate);
    socket.on('problem_statement_updated', handleProblemStatementUpdate);

    return () => {
      socket.off('code_updated', handleCodeUpdate);
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
    startHeight.current = codeEditorHeight;
  };

  const handleAddTestCase = (testCase: TestCase) => {
    setTestCases([...testCases, testCase]);
  };

  const handleUpdateTestCase = (index: number, testCase: TestCase) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index] = testCase;
    setTestCases(updatedTestCases);
  };

  const handleDeleteTestCase = (index: number) => {
    const updatedTestCases = [...testCases];
    updatedTestCases.splice(index, 1);
    setTestCases(updatedTestCases);
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
      // const cheatResult = await checkForCheating();
      // console.log('Cheat detection result:', cheatResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Add the handleUpdateProblem function
  const handleUpdateProblem = (newStatement: string) => {
    setProblemStatement(newStatement);
    sendProblemStatementUpdate(sessionId, newStatement);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#1E1E1E',
      color: '#CCCCCC'
    }}>
      <CssBaseline />
      <Navbar 
        isInterviewer={isInterviewer}
      />
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          width: `${descriptionWidth}px`, 
          minWidth: '200px',
          maxWidth: '600px',
          borderRight: '1px solid #404040',
          overflow: 'hidden'
        }}>
          <ProblemDescription 
            isInterviewer={isInterviewer}
          />
        </Box>
        
        {/* Horizontal resize handle */}
        <Box
          sx={{
            width: '4px',
            cursor: 'col-resize',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onMouseDown={handleMouseDown}
        />

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            height: `${codeEditorHeight}px`,
            minHeight: '200px',
            borderBottom: '1px solid #404040',
            overflow: 'hidden'
          }}>
            <CodeEditor 
              onRunCode={handleRunCode}
              loading={loading}
              sessionId={sessionId}
            />
          </Box>

          {/* Vertical resize handle */}
          <Box
            sx={{
              height: '4px',
              cursor: 'row-resize',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
            onMouseDown={handleVerticalMouseDown}
          />

          <Box sx={{ 
            flex: 1,
            overflow: 'hidden'
          }}>
            <TestResults 
              ref={testResultsRef}
              loading={loading}
              isInterviewer={isInterviewer}
            />
          </Box>
        </Box>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Candidate Activity Overlay - only visible to interviewers */}
      {isInterviewer && (
        <CandidateActivityOverlay />
      )}
    </Box>
  );
};

export default CodingEnvironment; 
