import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Typography } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useWebSocket } from '../contexts/WebSocketContext';

interface CodeEditorProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  onRunCode: () => void;
  loading: boolean;
  sessionId: string;
}

const CodeEditor = ({
  code,
  onCodeChange,
  onRunCode,
  loading,
  sessionId
}: CodeEditorProps) => {
  const { sendCodeUpdate, isConnected } = useWebSocket();
  const lastSentCode = useRef<string>(code);

  // Update lastSentCode when code prop changes
  useEffect(() => {
    lastSentCode.current = code;
  }, [code]);

  const handleCodeChange = (value: string | undefined) => {
    if (!value) return;
    
    // Call the parent's onCodeChange handler
    onCodeChange(value);
    
    // Send code update through WebSocket if connected
    if (isConnected && value !== lastSentCode.current) {
      console.log('Sending code update through WebSocket');
      sendCodeUpdate(sessionId, value);
      lastSentCode.current = value;
    }
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
          onClick={onRunCode}
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
        border: '1px solid #404040',
        mx: 2,
        my: 2
      }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
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