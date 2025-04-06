import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface Parameter {
  name: string;
  type: string;
  example: string;
}

interface ProblemTemplateProps {
  code: string;
  onUpdateTestUI: (params: Parameter[], returnType: string) => void;
  onError: (message: string) => void;
}

const TYPE_EXAMPLES: Record<string, string> = {
  'List[int]': '[1, 2, 3]',
  'List[str]': '["a", "b", "c"]',
  'List[float]': '[1.0, 2.5, 3.7]',
  'int': '42',
  'str': '"hello"',
  'float': '3.14',
  'bool': 'True',
  'Dict[str, int]': '{"key": 1}',
  'Set[int]': '{1, 2, 3}',
  'Tuple[int, int]': '(1, 2)'
};

const VALID_TYPES = new Set([
  'int', 'str', 'float', 'bool',
  'List[int]', 'List[str]', 'List[float]',
  'Dict[str, int]', 'Set[int]', 'Tuple[int, int]'
]);

const ProblemTemplate: React.FC<ProblemTemplateProps> = ({ code, onUpdateTestUI, onError }) => {
  const parseFunctionSignature = () => {
    try {
      // Check for basic Python function structure
      if (!code.trim().startsWith('def ')) {
        throw new Error('Function must start with "def"');
      }

      // Check for proper function name
      const funcNameMatch = code.match(/def\s+(\w+)/);
      if (!funcNameMatch) {
        throw new Error('Invalid function name');
      }

      // Check for proper parentheses
      if (!code.includes('(') || !code.includes(')')) {
        throw new Error('Function must have parentheses for parameters');
      }

      // Check for return type arrow
      if (!code.includes('->')) {
        throw new Error('Function must specify return type with "->"');
      }

      // Regex to match Python function signature
      const signatureRegex = /def\s+(\w+)\s*\((.*?)\)\s*->\s*([\w\[\],\s]+):/;
      const match = code.match(signatureRegex);

      if (!match) {
        throw new Error('Invalid function signature format');
      }

      const [_, funcName, params, returnType] = match;
      
      // Validate return type
      if (!VALID_TYPES.has(returnType.trim())) {
        throw new Error(`Invalid return type: ${returnType.trim()}`);
      }
      
      // Parse parameters
      const parameters: Parameter[] = params.split(',')
        .map(param => param.trim())
        .filter(param => param)
        .map(param => {
          const [name, type] = param.split(':').map(s => s.trim());
          if (!name || !type) {
            throw new Error(`Invalid parameter format: ${param}`);
          }
          if (!VALID_TYPES.has(type)) {
            throw new Error(`Invalid parameter type: ${type}`);
          }
          return {
            name,
            type,
            example: TYPE_EXAMPLES[type] || 'value'
          };
        });

      onUpdateTestUI(parameters, returnType.trim());
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to parse function signature');
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button 
        variant="outlined"
        onClick={parseFunctionSignature}
        sx={{ 
          mb: 1,
          color: '#4CAF50',
          borderColor: '#4CAF50',
          textTransform: 'none',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.9rem',
          '&:hover': {
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            borderColor: '#4CAF50'
          }
        }}
      >
        Parse Function Signature
      </Button>
    </Box>
  );
};

export default ProblemTemplate; 