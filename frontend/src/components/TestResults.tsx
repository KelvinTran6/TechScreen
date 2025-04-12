import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, Button, Typography, TextField, IconButton, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { currentLanguageConfig } from '../utils/languageUtils';
import useDebounce from '../hooks/useDebounce';
import { useRecoilState, useRecoilValue } from 'recoil';
import { codeAtom, testCasesAtom, testResultsAtom, parametersAtom, returnTypeAtom } from '../recoil';
import { Parameter, TestCase, TestResult } from '../types';

export interface TestResultsProps {
  loading: boolean;
  isInterviewer: boolean;
}

export interface TestResultsRef {
  handleUpdateTestUI: (params: Parameter[], returnType: string) => void;
}

const TestCaseTab: React.FC<{
  testCase: TestCase;
  parameters: Parameter[];
  returnType: string;
  onChange: (testCase: TestCase) => void;
}> = ({ testCase, parameters, returnType, onChange }) => {
  const [inputs, setInputs] = React.useState<string[]>([]);
  const [output, setOutput] = React.useState<string>('');

  React.useEffect(() => {
    setInputs(testCase.inputs.map(input => {
      if (input === null || input === undefined) return '';
      return typeof input === 'object' ? JSON.stringify(input) : String(input);
    }));
    setOutput(testCase.output === null || testCase.output === undefined ? '' 
      : typeof testCase.output === 'object' ? JSON.stringify(testCase.output) : String(testCase.output));
  }, [testCase]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    
    try {
      const parsedInputs = newInputs.map((input, i) => {
        if (input.trim() === '') return null;
        return currentLanguageConfig.parseValue(input, parameters[i].type);
      });

      onChange({
        inputs: parsedInputs,
        output: output.trim() === '' ? null : currentLanguageConfig.parseValue(output, returnType)
      });
    } catch (error) {
      console.error('Error parsing values:', error);
    }
  };

  const handleOutputChange = (value: string) => {
    setOutput(value);
    
    try {
      const parsedInputs = inputs.map((input, i) => {
        if (input.trim() === '') return null;
        return currentLanguageConfig.parseValue(input, parameters[i].type);
      });

      onChange({
        inputs: parsedInputs,
        output: value.trim() === '' ? null : currentLanguageConfig.parseValue(value, returnType)
      });
    } catch (error) {
      console.error('Error parsing values:', error);
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#1E1E1E' }}>
      <Box sx={{ p: 2, bgcolor: '#252526', borderRadius: 1, border: '1px solid #404040' }}>
        {parameters.map((param, idx) => (
          <Box key={param.name} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={`${param.name} (${param.type})`}
              value={inputs[idx] || ''}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              placeholder={param.example ? `Example: ${param.example}` : ''}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  bgcolor: '#2D2D2D',
                  color: '#CCCCCC',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.9rem'
                },
                '& .MuiInputLabel-root': {
                  color: '#CCCCCC',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.9rem'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#404040'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#606060'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#808080'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4CAF50'
                }
              }}
            />
          </Box>
        ))}

        <TextField
          fullWidth
          label={`Expected Output (${returnType})`}
          value={output}
          onChange={(e) => handleOutputChange(e.target.value)}
          placeholder={`Example: ${currentLanguageConfig.typeExamples[returnType] || 'value'}`}
          size="small"
          sx={{
            mb: 2,
            '& .MuiInputBase-root': {
              bgcolor: '#2D2D2D',
              color: '#CCCCCC',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem'
            },
            '& .MuiInputLabel-root': {
              color: '#CCCCCC',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem'
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#404040'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#606060'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#808080'
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#4CAF50'
            }
          }}
        />
      </Box>
    </Box>
  );
};

const ResultsTab: React.FC<{
  results: TestResult[];
  loading?: boolean;
  onTestCaseClick?: (index: number) => void;
}> = ({ results, loading, onTestCaseClick }) => {
  if (loading) {
    return (
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}>
        <CircularProgress sx={{ color: '#4CAF50' }} />
        <Typography sx={{ 
          color: '#CCCCCC',
          fontSize: '0.9rem',
          fontFamily: 'Consolas, Monaco, monospace'
        }}>
          Running test cases...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {results.map((result, index) => (
        <Box
          key={index}
          onClick={() => onTestCaseClick?.(index)}
          sx={{
            mb: 3,
            p: 2,
            bgcolor: result.passed ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)',
            borderRadius: 1,
            border: `1px solid ${result.passed ? '#4caf50' : '#f44336'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              filter: 'brightness(1.1)',
              transform: 'translateY(-1px)'
            },
            '& .label': {
              color: '#808080',
              fontSize: '0.85rem',
              fontFamily: 'Consolas, Monaco, monospace',
              mb: 0.5
            },
            '& .content': {
              color: '#CCCCCC',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ 
              color: '#CCCCCC',
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace',
              fontWeight: 500
            }}>
              Test Case {index + 1}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {result.passed ? (
                <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.1rem' }} />
              ) : (
                <CancelIcon sx={{ color: '#f44336', fontSize: '1.1rem' }} />
              )}
              <Typography sx={{
                color: result.passed ? '#4caf50' : '#f44336',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: 'Consolas, Monaco, monospace'
              }}>
                {result.passed ? 'Passed' : 'Failed'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography className="label">Inputs:</Typography>
            <Typography className="content">
              {result.testCase.inputs.map((input, i) => currentLanguageConfig.formatValue(input)).join(', ')}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography className="label">Expected Output:</Typography>
            <Typography className="content">{currentLanguageConfig.formatValue(result.testCase.output)}</Typography>
          </Box>
          <Box sx={{ mb: result.error ? 2 : 0 }}>
            <Typography className="label">Actual Output:</Typography>
            <Typography className="content">{currentLanguageConfig.formatValue(result.actualOutput)}</Typography>
          </Box>
          {result.error && (
            <Box sx={{ color: '#f44336' }}>
              <Typography className="label">Error:</Typography>
              <Typography className="content">{result.error}</Typography>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

const TestResults = forwardRef<TestResultsRef, TestResultsProps>(({
  loading,
  isInterviewer
}, ref) => {
  // Use Recoil atoms instead of props
  const code = useRecoilValue(codeAtom);
  const [testCases, setTestCases] = useRecoilState(testCasesAtom);
  const [testResults, setTestResults] = useRecoilState(testResultsAtom);
  const [parameters, setParameters] = useRecoilState(parametersAtom);
  const [returnType, setReturnType] = useRecoilState(returnTypeAtom);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParsedSignature, setLastParsedSignature] = useState<string>('');
  
  // Debounce the code to avoid checking for signature changes on every keystroke
  const debouncedCode = useDebounce(code, 1000);
  
  // Function to extract the function signature from code
  const extractFunctionSignature = (code: string): string | null => {
    try {
      const functionRegex = /def\s+(\w+)\s*\((.*?)\)\s*->\s*(\w+)/;
      const match = code.match(functionRegex);
      
      if (match) {
        const [_, functionName, paramsStr, retType] = match;
        return `${functionName}(${paramsStr})->${retType}`;
      }
      return null;
    } catch (err) {
      return null;
    }
  };
  
  // Check if the function signature has changed when the debounced code changes
  useEffect(() => {
    const currentSignature = extractFunctionSignature(debouncedCode);
    
    if (currentSignature && currentSignature !== lastParsedSignature) {
      // Function signature has changed, reset parameters and return type
      setParameters([]);
      setReturnType('');
      setError(null);
    }
  }, [debouncedCode, lastParsedSignature]);
  
  // Show results when loading
  useEffect(() => {
    if (loading) {
      setShowResults(true);
    }
  }, [loading]);

  const handleTestCaseClick = (index: number) => {
    setShowResults(false);
    setActiveTab(index);
  };

  useImperativeHandle(ref, () => ({
    handleUpdateTestUI: (params: Parameter[], retType: string) => {
      console.log('handleUpdateTestUI called with params:', params, 'and returnType:', retType);
      setParameters(params);
      setReturnType(retType);
      
      // Create a signature string for comparison
      const paramString = params.map(p => `${p.name}: ${p.type}`).join(', ');
      const signature = `(${paramString})->${retType}`;
      console.log('Setting lastParsedSignature to:', signature);
      setLastParsedSignature(signature);
      
      if (testCases.length === 0) {
        console.log('No test cases, creating a sample test case');
        const sampleInputs = params.map(param => {
          if (!param.example) return '';
          try {
            return JSON.parse(param.example);
          } catch {
            return param.example;
          }
        });
        const sampleOutput = currentLanguageConfig.typeExamples[retType] ? JSON.parse(currentLanguageConfig.typeExamples[retType]) : '';
        setTestCases(prev => [...prev, {
          inputs: sampleInputs,
          output: sampleOutput
        }]);
      }
    }
  }));

  const parseFunctionSignature = (code: string): boolean => {
    try {
      console.log('Parsing function signature, current test cases:', testCases.length);
      
      // Clear existing test cases when parsing a new function signature
      if (testCases.length > 0) {
        console.log('Removing all existing test cases');
        // Remove all test cases
        setTestCases([]);
      }

      // Extract function signature using regex
      const functionRegex = /def\s+(\w+)\s*\((.*?)\)\s*->\s*(\w+)/;
      const match = code.match(functionRegex);
      
      if (!match) {
        setError('Could not find a valid function signature. Please ensure your code contains a function with a return type annotation.');
        return false;
      }
      
      const [_, functionName, paramsStr, retType] = match;
      
      // Store the function signature for comparison
      const signature = `${functionName}(${paramsStr})->${retType}`;
      setLastParsedSignature(signature);
      
      // Parse parameters
      const params: Parameter[] = [];
      if (paramsStr.trim()) {
        const paramRegex = /(\w+):\s*(\w+)(?:\s*=\s*([^,]+))?/g;
        let paramMatch;
        
        while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
          const [_, name, type, defaultValue] = paramMatch;
          params.push({
            name,
            type,
            example: defaultValue ? defaultValue.trim() : currentLanguageConfig.typeExamples[type] || ''
          });
        }
      }
      
      setParameters(params);
      setReturnType(retType);
      setError(null);
      
      // Create a sample test case with the parsed parameters
      if (params.length > 0) {
        console.log('Creating a new sample test case');
        const sampleInputs = params.map(param => {
          if (!param.example) return '';
          try {
            return JSON.parse(param.example);
          } catch {
            return param.example;
          }
        });
        const sampleOutput = currentLanguageConfig.typeExamples[retType] ? JSON.parse(currentLanguageConfig.typeExamples[retType]) : '';
        setTestCases(prev => [...prev, {
          inputs: sampleInputs,
          output: sampleOutput
        }]);
      }
      
      return true;
    } catch (err) {
      console.error('Error parsing function signature:', err);
      setError('Error parsing function signature. Please check your code format.');
      return false;
    }
  };

  const handleAddTestCase = () => {
    if (parameters.length === 0) {
      console.log('No parameters set, parsing function signature');
      // If no parameters are set, try to parse the function signature
      parseFunctionSignature(code);
    } else {
      console.log('Parameters already set, adding a new test case');
      // If parameters are already set, add a new test case
      const newTestCase: TestCase = {
        inputs: parameters.map(param => {
          if (!param.example) return '';
          try {
            return JSON.parse(param.example);
          } catch {
            return param.example;
          }
        }),
        output: currentLanguageConfig.typeExamples[returnType] ? JSON.parse(currentLanguageConfig.typeExamples[returnType]) : ''
      };
      setTestCases(prev => [...prev, newTestCase]);
    }
  };

  const handleDeleteTab = (index: number) => {
    setTestCases(prev => prev.filter((_, i) => i !== index));
    if (activeTab >= index) {
      setActiveTab(Math.max(0, activeTab - 1));
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: '#252526'
    }}>
      {error && (
        <Box sx={{ p: 1, bgcolor: 'rgba(244, 67, 54, 0.1)', borderBottom: '1px solid #f44336' }}>
          <Typography sx={{ color: '#f44336', fontSize: '0.9rem' }}>
            {error}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ 
        borderBottom: '1px solid #404040',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#2D2D2D'
      }}>
        <Tabs 
          value={showResults ? testCases.length : activeTab}
          onChange={(_, newValue) => {
            if (newValue === testCases.length) {
              setShowResults(true);
            } else {
              setShowResults(false);
              setActiveTab(newValue);
            }
          }}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            sx: {
              backgroundColor: '#4CAF50'
            }
          }}
          sx={{ 
            flex: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 120,
              color: '#808080',
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace',
              '&.Mui-selected': {
                color: '#4CAF50'
              },
              '&:hover': {
                color: '#CCCCCC',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            },
            '& .MuiTabs-scrollButtons': {
              color: '#808080',
              '&.Mui-disabled': {
                color: '#404040'
              },
              '&:hover': {
                color: '#CCCCCC',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }
            }
          }}
        >
          {testCases.map((_, index) => (
            <Tab 
              key={index}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{`Test Case ${index + 1}`}</span>
                  <DeleteIcon 
                    sx={{ 
                      fontSize: 16,
                      opacity: 0.7,
                      color: '#CCCCCC',
                      '&:hover': { 
                        opacity: 1,
                        color: '#FF6B6B'
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTab(index);
                    }}
                  />
                </Box>
              }
            />
          ))}
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Results</span>
                {loading && (
                  <CircularProgress size={16} sx={{ color: '#4CAF50' }} />
                )}
                {!loading && testResults.length > 0 && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: testResults.every(r => r.passed) ? '#4caf50' : '#f44336'
                    }}
                  >
                    ({testResults.filter(r => r.passed).length}/{testResults.length})
                  </Typography>
                )}
              </Box>
            }
          />
        </Tabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddTestCase}
            sx={{
              bgcolor: '#4CAF50',
              '&:hover': {
                bgcolor: '#3E8E41',
              },
              fontSize: '0.9rem',
              py: 0.5,
              px: 2,
            }}
          >
            {parameters.length === 0 ? 'Parse Function Signature' : 'Add Test Case'}
          </Button>
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#1E1E1E' }}>
        {testCases.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography sx={{ 
              color: '#CCCCCC',
              fontSize: '0.9rem',
              fontFamily: 'Consolas, Monaco, monospace'
            }}>
              {parameters.length === 0 
                ? 'Click "Parse Function Signature" to start adding test cases.'
                : 'No test cases yet. Click "Add Test Case" to create one.'}
            </Typography>
          </Box>
        ) : showResults ? (
          <ResultsTab 
            results={testResults} 
            loading={loading} 
            onTestCaseClick={handleTestCaseClick}
          />
        ) : (
          <TestCaseTab
            testCase={testCases[activeTab]}
            parameters={parameters}
            returnType={returnType}
            onChange={(testCase) => setTestCases(prev => prev.map((t, i) => i === activeTab ? testCase : t))}
          />
        )}
      </Box>
    </Box>
  );
});

TestResults.displayName = 'TestResults';

export default TestResults; 