import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';

interface KeystrokeData {
  key: string;
  key_code: number;
  keydown_delay: number;
  keyup_delay: number;
  is_backspace: number;
}

interface CodeEditorProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  onRunCode: () => void;
  loading: boolean;
  onKeystrokesLog?: (keystrokes: KeystrokeData[]) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  onRunCode,
  loading,
  onKeystrokesLog,
}) => {
  const [keystrokes, setKeystrokes] = useState<KeystrokeData[]>([]);
  const lastKeyDownTime = useRef<number>(0);
  const lastKeyUpTime = useRef<number>(0);

  const handleRunCode = () => {
    if (onKeystrokesLog) {
      onKeystrokesLog(keystrokes);
      // Clear the keystrokes after logging
      setKeystrokes([]);
    }
    onRunCode();
  };

  const handleEditorDidMount = (editor: any) => {
    // Add keydown event listener
    editor.onKeyDown((e: any) => {
      const currentTime = Date.now();
      const keydownDelay = lastKeyDownTime.current ? (currentTime - lastKeyDownTime.current) / 1000 : 0;
      lastKeyDownTime.current = currentTime;

      const newKeystroke: KeystrokeData = {
        key: e.browserEvent.key,
        key_code: e.browserEvent.keyCode,
        keydown_delay: keydownDelay,
        keyup_delay: 0, // Will be updated on keyup
        is_backspace: e.browserEvent.key === 'Backspace' ? 1 : 0
      };

      setKeystrokes(prev => [...prev, newKeystroke]);
    });

    // Add keyup event listener
    editor.onKeyUp((e: any) => {
      const currentTime = Date.now();
      const keyupDelay = lastKeyUpTime.current ? (currentTime - lastKeyUpTime.current) / 1000 : 0;
      lastKeyUpTime.current = currentTime;

      setKeystrokes(prev => {
        if (prev.length > 0) {
          const lastKeystroke = prev[prev.length - 1];
          lastKeystroke.keyup_delay = keyupDelay;
          return [...prev.slice(0, -1), lastKeystroke];
        }
        return prev;
      });
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      p: 2
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        px: 2
      }}>
        <Typography variant="h6" sx={{ color: '#CCCCCC' }}>
          Code Editor
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRunCode}
          disabled={loading}
          startIcon={<PlayArrowIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            color: '#4CAF50',
            borderColor: '#4CAF50',
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
              borderColor: '#4CAF50'
            },
            '&.Mui-disabled': {
              color: '#808080',
              borderColor: '#404040'
            }
          }}
        >
          Run Code
        </Button>
      </Box>
      <Box sx={{ 
        flex: 1, 
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        mx: 2,
        my: 2,
        p: 2
      }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </Box>
    </Box>
  );
};

export default CodeEditor; 