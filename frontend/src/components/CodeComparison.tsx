import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { ActivityItem, ActivityOverlayProps } from '../types/ActivityTypes';
import Editor from '@monaco-editor/react';

// Styled components
const CodeComparisonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '4px',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(76, 175, 80, 0.7)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
}));

const EditorContainer = styled(Box)(({ theme }) => ({
  height: '180px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '4px',
  overflow: 'hidden',
  margin: '0 2px',
}));

const CodeComparison: React.FC<ActivityOverlayProps> = ({ 
  activities, 
  onActivityExpired 
}) => {
  const [code, setCode] = useState('# Paste in code you want to compare with');

  const handleCompareCode = () => {
    // This would be implemented later to compare the candidate's code with the pasted code
    console.log('Comparing code:', code);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  return (
    <CodeComparisonContainer>
      <EditorContainer>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            lineNumbersMinChars: 2,
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 20,
            lineNumbers: (lineNumber) => lineNumber.toString(),
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            wordBasedSuggestions: 'off',
            parameterHints: { enabled: false },
            bracketPairColorization: { enabled: false },
            renderWhitespace: 'none',
            renderControlCharacters: false,
            renderLineHighlight: 'none',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6
            }
          }}
        />
      </EditorContainer>
      <StyledButton
        variant="contained"
        startIcon={<CompareArrowsIcon />}
        onClick={handleCompareCode}
        fullWidth
        disabled={!code.trim()}
      >
        Compare Code
      </StyledButton>
    </CodeComparisonContainer>
  );
};

export default CodeComparison; 