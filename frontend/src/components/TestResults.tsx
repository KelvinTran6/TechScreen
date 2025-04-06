import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Button, TextField, Typography, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { TestCase, TestResult, Parameter } from '../types';
import { currentLanguageConfig } from '../utils/languageUtils';

interface TestResultsProps {
  testCases: TestCase[];
  results: TestResult[];
  onAddTestCase: (testCase: TestCase) => void;
  onUpdateTestCase: (index: number, testCase: TestCase) => void;
  onDeleteTestCase: (index: number) => void;
  loading?: boolean;
}

interface TestResultsRef {
  handleUpdateTestUI: (params: Parameter[], retType: string) => void;
}

const TestCaseTab: React.FC<{
  testCase: TestCase;
  parameters: Parameter[];
  returnType: string;
  onChange: (testCase: TestCase) => void;
}> = ({ testCase, parameters, returnType, onChange }) => {
  const [inputs, setInputs] = React.useState<string[]>([]);
  const [output, setOutput] = React.useState<string>('');

  // Update local state when testCase changes
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
      // Parse each input according to its parameter type
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
              placeholder={`Example: ${param.example}`}
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

const TestResults = forwardRef<TestResultsRef, TestResultsProps>((props, ref) => {
  const { testCases, results, onAddTestCase, onUpdateTestCase, onDeleteTestCase, loading } = props;
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [returnType, setReturnType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);

  // If code is running, automatically show the results tab
  React.useEffect(() => {
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
      setParameters(params);
      setReturnType(retType);
      
      // If no test cases exist, create a sample test case
      if (testCases.length === 0) {
        const sampleInputs = params.map(param => {
          try {
            return JSON.parse(param.example);
          } catch {
            return param.example;
          }
        });
        const sampleOutput = currentLanguageConfig.typeExamples[retType] ? JSON.parse(currentLanguageConfig.typeExamples[retType]) : '';
        onAddTestCase({
          inputs: sampleInputs,
          output: sampleOutput
        });
      }
    }
  }));

  const handleAddTestCase = () => {
    const emptyInputs = parameters.map(() => null);
    onAddTestCase({
      inputs: emptyInputs,
      output: null
    });
    // Switch to the new tab
    setActiveTab(testCases.length);
  };

  const handleDeleteTab = (index: number) => {
    onDeleteTestCase(index);
    // If we're deleting the current tab or one before it, update the active tab
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
                {!loading && results.length > 0 && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: results.every(r => r.passed) ? '#4caf50' : '#f44336'
                    }}
                  >
                    ({results.filter(r => r.passed).length}/{results.length})
                  </Typography>
                )}
              </Box>
            }
          />
        </Tabs>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddTestCase}
          variant="outlined"
          sx={{ 
            mx: 1,
            color: parameters.length === 0 ? '#808080' : '#4CAF50',
            borderColor: parameters.length === 0 ? '#404040' : '#4CAF50',
            '&.Mui-disabled': {
              color: '#808080',
              borderColor: '#404040'
            },
            textTransform: 'none',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
              borderColor: parameters.length === 0 ? '#404040' : '#4CAF50'
            }
          }}
          disabled={parameters.length === 0}
        >
          {parameters.length === 0 ? 'Parse Function First' : 'Add Test Case'}
        </Button>
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
                ? 'Parse a function signature to start adding test cases.'
                : 'No test cases yet. Click "Add Test Case" to create one.'}
            </Typography>
          </Box>
        ) : showResults ? (
          <ResultsTab 
            results={results} 
            loading={loading} 
            onTestCaseClick={handleTestCaseClick}
          />
        ) : (
          <TestCaseTab
            testCase={testCases[activeTab]}
            parameters={parameters}
            returnType={returnType}
            onChange={(testCase) => onUpdateTestCase(activeTab, testCase)}
          />
        )}
      </Box>
    </Box>
  );
});

TestResults.displayName = 'TestResults';

export default TestResults; 