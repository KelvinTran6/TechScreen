import React, { useState } from 'react';
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

// Styled components
const KeyboardKey = styled(Box)<{ isSelected?: boolean }>(({ theme, isSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '30px',
  height: '30px',
  margin: '2px',
  borderRadius: '4px',
  backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.7)' : 'rgba(60, 60, 60, 0.8)',
  border: isSelected ? '2px solid rgba(76, 175, 80, 0.9)' : '1px solid rgba(255, 255, 255, 0.2)',
  color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)',
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.8)' : 'rgba(80, 80, 80, 0.8)',
    transform: 'translateY(-1px)',
  },
}));

const KeyboardRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '2px',
}));

const ModifierKey = styled(KeyboardKey)(({ theme }) => ({
  width: '45px',
  backgroundColor: 'rgba(70, 70, 70, 0.8)',
}));

const SpaceKey = styled(KeyboardKey)(({ theme }) => ({
  width: '150px',
}));

const MonitoredKeyCombo = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  margin: '4px',
  borderRadius: '4px',
  backgroundColor: 'rgba(76, 175, 80, 0.2)',
  border: '1px solid rgba(76, 175, 80, 0.5)',
  color: 'rgba(76, 175, 80, 0.9)',
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '12px',
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
}));

const MonitoredKeyComboContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginTop: '8px',
  padding: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '4px',
  maxHeight: '200px',
  overflowY: 'auto',
}));

const DeleteIconButton = styled(IconButton)(({ theme }) => ({
  padding: '2px',
  marginLeft: '4px',
  color: 'rgba(255, 87, 34, 0.7)',
  '&:hover': {
    color: 'rgba(255, 87, 34, 1)',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    maxHeight: '90vh',
  },
}));

interface KeyboardInterfaceProps {
  open: boolean;
  onClose: () => void;
  highlightedKeyCombos: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }>;
  onAddKeyCombo: (newCombos: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }>) => void;
  onRemoveKeyCombo: (index: number) => void;
}

const KeyboardInterface: React.FC<KeyboardInterfaceProps> = ({
  open,
  onClose,
  highlightedKeyCombos,
  onAddKeyCombo,
  onRemoveKeyCombo,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [useCtrl, setUseCtrl] = useState(false);
  const [useAlt, setUseAlt] = useState(false);
  const [useShift, setUseShift] = useState(false);
  const [useMeta, setUseMeta] = useState(false);

  const handleKeyClick = (key: string) => {
    setSelectedKeys(prev => {
      // If key is already selected, remove it
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      // Otherwise add it to the selection
      return [...prev, key];
    });
  };

  const handleAddKeyCombo = () => {
    if (selectedKeys.length > 0) {
      // Create a key combination for each selected key
      const newCombos = selectedKeys.map(key => ({
        key: key,
        ctrlKey: useCtrl || undefined,
        altKey: useAlt || undefined,
        shiftKey: useShift || undefined,
        metaKey: useMeta || undefined,
      }));
      
      onAddKeyCombo(newCombos);
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    // Reset form
    setSelectedKeys([]);
    setUseCtrl(false);
    setUseAlt(false);
    setUseShift(false);
    setUseMeta(false);
    onClose();
  };

  const formatKeyComboDisplay = (combo: { key: string; ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean; metaKey?: boolean }) => {
    const parts = [];
    
    if (combo.ctrlKey) parts.push('Ctrl');
    if (combo.altKey) parts.push('Alt');
    if (combo.shiftKey) parts.push('Shift');
    if (combo.metaKey) parts.push('Meta');
    
    // Format the key
    if (combo.key === ' ') {
      parts.push('Space');
    } else if (combo.key === 'Escape') {
      parts.push('Esc');
    } else if (combo.key === 'ArrowUp') {
      parts.push('↑');
    } else if (combo.key === 'ArrowDown') {
      parts.push('↓');
    } else if (combo.key === 'ArrowLeft') {
      parts.push('←');
    } else if (combo.key === 'ArrowRight') {
      parts.push('→');
    } else if (combo.key === 'Enter') {
      parts.push('↵');
    } else if (combo.key === 'Tab') {
      parts.push('Tab');
    } else if (combo.key === 'Backspace') {
      parts.push('⌫');
    } else if (combo.key === 'Delete') {
      parts.push('⌦');
    } else if (combo.key === 'Home') {
      parts.push('Home');
    } else if (combo.key === 'End') {
      parts.push('End');
    } else if (combo.key === 'PageUp') {
      parts.push('PgUp');
    } else if (combo.key === 'PageDown') {
      parts.push('PgDn');
    } else if (combo.key === 'Insert') {
      parts.push('Ins');
    } else if (combo.key === 'Control') {
      parts.push('Ctrl');
    } else if (combo.key === 'Meta') {
      parts.push('Win');
    } else if (combo.key === 'Alt') {
      parts.push('Alt');
    } else if (combo.key === 'Shift') {
      parts.push('Shift');
    } else {
      parts.push(combo.key.toUpperCase());
    }
    
    return parts.join('+');
  };

  // Render a row of keyboard keys
  const renderKeyboardRow = (keys: string[]) => {
    return (
      <KeyboardRow>
        {keys.map((key) => (
          <KeyboardKey 
            key={key} 
            isSelected={selectedKeys.includes(key)}
            onClick={() => handleKeyClick(key)}
          >
            {key}
          </KeyboardKey>
        ))}
      </KeyboardRow>
    );
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={handleCloseDialog} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px',
        }
      }}
    >
      <DialogTitle sx={{ py: 1 }}>Add New Key Combinations</DialogTitle>
      <DialogContent sx={{ p: 1, height: 'calc(100% - 120px)', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            <ModifierKey 
              isSelected={useCtrl}
              onClick={() => setUseCtrl(!useCtrl)}
            >
              Ctrl
            </ModifierKey>
            <ModifierKey 
              isSelected={useAlt}
              onClick={() => setUseAlt(!useAlt)}
            >
              Alt
            </ModifierKey>
            <ModifierKey 
              isSelected={useShift}
              onClick={() => setUseShift(!useShift)}
            >
              Shift
            </ModifierKey>
            <ModifierKey 
              isSelected={useMeta}
              onClick={() => setUseMeta(!useMeta)}
            >
              Meta
            </ModifierKey>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5, fontSize: '0.8rem' }}>
            Click on keys to select them (you can select multiple):
          </Typography>
          
          {/* Function keys row */}
          <KeyboardRow>
            {['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].map((key) => (
              <KeyboardKey 
                key={key} 
                isSelected={selectedKeys.includes(key)}
                onClick={() => handleKeyClick(key)}
              >
                {key}
              </KeyboardKey>
            ))}
          </KeyboardRow>
          
          {/* Number row */}
          {renderKeyboardRow(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='])}
          
          {/* First letter row */}
          {renderKeyboardRow(['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'])}
          
          {/* Second letter row */}
          {renderKeyboardRow(['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"])}
          
          {/* Third letter row */}
          {renderKeyboardRow(['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'])}
          
          {/* Bottom row with space and special keys */}
          <KeyboardRow>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Control')}
              onClick={() => handleKeyClick('Control')}
            >
              Ctrl
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Meta')}
              onClick={() => handleKeyClick('Meta')}
            >
              Win
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Alt')}
              onClick={() => handleKeyClick('Alt')}
            >
              Alt
            </KeyboardKey>
            <SpaceKey 
              isSelected={selectedKeys.includes(' ')}
              onClick={() => handleKeyClick(' ')}
            >
              Space
            </SpaceKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Alt')}
              onClick={() => handleKeyClick('Alt')}
            >
              Alt
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Meta')}
              onClick={() => handleKeyClick('Meta')}
            >
              Win
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Control')}
              onClick={() => handleKeyClick('Control')}
            >
              Ctrl
            </KeyboardKey>
          </KeyboardRow>
          
          {/* Special keys row */}
          <KeyboardRow>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Insert')}
              onClick={() => handleKeyClick('Insert')}
            >
              Ins
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Home')}
              onClick={() => handleKeyClick('Home')}
            >
              Home
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('PageUp')}
              onClick={() => handleKeyClick('PageUp')}
            >
              PgUp
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('Delete')}
              onClick={() => handleKeyClick('Delete')}
            >
              Del
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('End')}
              onClick={() => handleKeyClick('End')}
            >
              End
            </KeyboardKey>
            <KeyboardKey 
              isSelected={selectedKeys.includes('PageDown')}
              onClick={() => handleKeyClick('PageDown')}
            >
              PgDn
            </KeyboardKey>
          </KeyboardRow>
          
          {/* Arrow keys */}
          <KeyboardRow>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <KeyboardKey 
                isSelected={selectedKeys.includes('ArrowUp')}
                onClick={() => handleKeyClick('ArrowUp')}
              >
                ↑
              </KeyboardKey>
              <Box sx={{ display: 'flex' }}>
                <KeyboardKey 
                  isSelected={selectedKeys.includes('ArrowLeft')}
                  onClick={() => handleKeyClick('ArrowLeft')}
                >
                  ←
                </KeyboardKey>
                <KeyboardKey 
                  isSelected={selectedKeys.includes('ArrowDown')}
                  onClick={() => handleKeyClick('ArrowDown')}
                >
                  ↓
                </KeyboardKey>
                <KeyboardKey 
                  isSelected={selectedKeys.includes('ArrowRight')}
                  onClick={() => handleKeyClick('ArrowRight')}
                >
                  →
                </KeyboardKey>
              </Box>
            </Box>
          </KeyboardRow>
          
          {/* Selected keys display */}
          {selectedKeys.length > 0 && (
            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem' }}>
                Selected: {selectedKeys.join(', ')}
                {useCtrl && ' + Ctrl'}
                {useAlt && ' + Alt'}
                {useShift && ' + Shift'}
                {useMeta && ' + Meta'}
              </Typography>
            </Box>
          )}
          
          {/* Currently monitored key combinations */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, fontSize: '0.8rem' }}>
              Currently Monitored Key Combinations:
            </Typography>
            <MonitoredKeyComboContainer>
              {highlightedKeyCombos.length > 0 ? (
                highlightedKeyCombos.map((combo, index) => (
                  <MonitoredKeyCombo key={index}>
                    {formatKeyComboDisplay(combo)}
                    <DeleteIconButton 
                      size="small" 
                      onClick={() => onRemoveKeyCombo(index)}
                      sx={{ ml: 0.5 }}
                    >
                      <AddIcon sx={{ transform: 'rotate(45deg)', fontSize: '16px' }} />
                    </DeleteIconButton>
                  </MonitoredKeyCombo>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  No key combinations monitored yet
                </Typography>
              )}
            </MonitoredKeyComboContainer>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 1 }}>
        <Button onClick={handleCloseDialog} sx={{ color: 'rgba(255, 255, 255, 0.7)', py: 0.5 }}>
          Cancel
        </Button>
        <Button 
          onClick={handleAddKeyCombo} 
          variant="contained" 
          disabled={selectedKeys.length === 0}
          sx={{ 
            bgcolor: 'rgba(76, 175, 80, 0.7)',
            '&:hover': {
              bgcolor: 'rgba(76, 175, 80, 0.9)',
            },
            '&:disabled': {
              bgcolor: 'rgba(76, 175, 80, 0.3)',
            },
            py: 0.5,
          }}
        >
          Add
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default KeyboardInterface; 