import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import { ActivityItem, ActivityOverlayProps } from '../types/ActivityTypes';
import KeyboardInterface from './KeyboardInterface';
import { useRecoilValue } from 'recoil';
import { candidateActivitiesAtom } from '../recoil';

// Styled components
const KeyButton = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '50px',
  height: '50px',
  margin: '0 10px',
  padding: '0 15px',
  borderRadius: '8px',
  backgroundColor: 'rgba(76, 175, 80, 0.3)',
  border: '2px solid rgba(76, 175, 80, 0.7)',
  color: '#4CAF50',
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '16px',
  fontWeight: 'bold',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease-out',
  '&.highlighted': {
    backgroundColor: 'rgba(255, 87, 34, 0.4)',
    border: '2px solid rgba(255, 87, 34, 0.8)',
    color: '#FF5722',
    animation: 'pulse 1.5s infinite',
    transform: 'scale(1.1)',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(255, 87, 34, 0.7)',
    },
    '70%': {
      boxShadow: '0 0 0 15px rgba(255, 87, 34, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(255, 87, 34, 0)',
    },
  },
}));

const ActivityRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  width: '100%',
  height: '80px',
  overflow: 'hidden',
  position: 'relative',
}));

const AddButton = styled(IconButton)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  position: 'absolute',
  left: '0',
  top: '0',
  padding: '4px',
  '&:hover': {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const KeyCombinations: React.FC<Omit<ActivityOverlayProps, 'activities' | 'code'>> = ({ 
  onActivityExpired 
}) => {
  // Use Recoil atom directly
  const activities = useRecoilValue(candidateActivitiesAtom);
  
  const [displayedActivities, setDisplayedActivities] = useState<ActivityItem[]>([]);
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Define highlighted key combinations
  const [highlightedKeyCombos, setHighlightedKeyCombos] = useState<Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }>>([
    { key: 'b', ctrlKey: true },
    { key: 'Enter', ctrlKey: true },
    { key: 'h', ctrlKey: true },
    { key: 'g', ctrlKey: true },
    { key: 'F4', altKey: true },
    { key: 'ArrowUp', ctrlKey: true },
    { key: 'ArrowDown', ctrlKey: true },
    { key: 'ArrowLeft', ctrlKey: true },
    { key: 'ArrowRight', ctrlKey: true },
  ]);

  // Update displayed activities and reset the global timer whenever activities change
  useEffect(() => {
    // Get the most recent activities
    const recentActivities = [...activities].slice(-5);
    
    // Process activities to only include highlighted key combinations
    const processedActivities = recentActivities.reduce<ActivityItem[]>((acc, activity) => {
      if (activity.type === 'keypress') {
        // Check if this is a highlighted key combination
        const isHighlighted = highlightedKeyCombos.some(combo => 
          combo.key.toLowerCase() === activity.key?.toLowerCase() && 
          (combo.ctrlKey === undefined || combo.ctrlKey === activity.ctrlKey) &&
          (combo.altKey === undefined || combo.altKey === activity.altKey) &&
          (combo.shiftKey === undefined || combo.shiftKey === activity.shiftKey) &&
          (combo.metaKey === undefined || combo.metaKey === activity.metaKey)
        );
        
        // Only add the activity if it's a highlighted key combination
        if (isHighlighted) {
          acc.push({ ...activity, isHighlighted: true });
        }
      }
      
      return acc;
    }, []);
    
    // Update displayed activities
    setDisplayedActivities(processedActivities);
    
    // Reset the global timer whenever activities change
    if (globalTimerRef.current) {
      clearTimeout(globalTimerRef.current);
    }
    
    // Set a new global timer to clear all activities after 2 seconds
    globalTimerRef.current = setTimeout(() => {
      // Clear all displayed activities at once
      setDisplayedActivities([]);
    }, 2000);
    
    return () => {
      if (globalTimerRef.current) {
        clearTimeout(globalTimerRef.current);
      }
    };
  }, [activities, highlightedKeyCombos]);

  // Format keyboard shortcut display
  const formatKeyDisplay = (activity: ActivityItem) => {
    if (activity.type !== 'keypress') return '';
    
    const parts = [];
    
    // Only add modifier keys if they're not the main key being pressed
    if (activity.ctrlKey && activity.key !== 'Control') parts.push('Ctrl');
    if (activity.altKey && activity.key !== 'Alt') parts.push('Alt');
    if (activity.shiftKey && activity.key !== 'Shift') parts.push('Shift');
    if (activity.metaKey && activity.key !== 'Meta') parts.push('Meta');
    
    // Add the main key
    if (activity.key) {
      // Format special keys
      if (activity.key === ' ') {
        parts.push('Space');
      } else if (activity.key === 'Escape') {
        parts.push('Esc');
      } else if (activity.key === 'ArrowUp') {
        parts.push('↑');
      } else if (activity.key === 'ArrowDown') {
        parts.push('↓');
      } else if (activity.key === 'ArrowLeft') {
        parts.push('←');
      } else if (activity.key === 'ArrowRight') {
        parts.push('→');
      } else if (activity.key === 'Enter') {
        parts.push('↵');
      } else if (activity.key === 'Tab') {
        parts.push('Tab');
      } else if (activity.key === 'Backspace') {
        parts.push('⌫');
      } else if (activity.key === 'Delete') {
        parts.push('⌦');
      } else if (activity.key === 'Home') {
        parts.push('Home');
      } else if (activity.key === 'End') {
        parts.push('End');
      } else if (activity.key === 'PageUp') {
        parts.push('PgUp');
      } else if (activity.key === 'PageDown') {
        parts.push('PgDn');
      } else if (activity.key === 'Insert') {
        parts.push('Ins');
      } else if (activity.key === 'F1' || activity.key === 'F2' || activity.key === 'F3' || 
                 activity.key === 'F4' || activity.key === 'F5' || activity.key === 'F6' || 
                 activity.key === 'F7' || activity.key === 'F8' || activity.key === 'F9' || 
                 activity.key === 'F10' || activity.key === 'F11' || activity.key === 'F12') {
        parts.push(activity.key);
      } else if (activity.key === 'Control') {
        parts.push('Ctrl');
      } else {
        parts.push(activity.key.toUpperCase());
      }
    }
    
    return parts.join('+');
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddKeyCombo = (newCombos: Array<{
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  }>) => {
    setHighlightedKeyCombos(prev => [...prev, ...newCombos]);
  };

  const handleRemoveKeyCombo = (index: number) => {
    setHighlightedKeyCombos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <ActivityRow>
        {displayedActivities.length > 0 ? (
          displayedActivities.map((activity) => (
            <KeyButton 
              key={activity.id}
              className={`${activity.isHighlighted ? 'highlighted' : ''}`}
            >
              {formatKeyDisplay(activity)}
            </KeyButton>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic' }}>
            Flagged Key Combinations
          </Typography>
        )}
        <AddButton onClick={handleOpenDialog} size="small">
          <SettingsIcon />
        </AddButton>
      </ActivityRow>

      <KeyboardInterface
        open={openDialog}
        onClose={handleCloseDialog}
        highlightedKeyCombos={highlightedKeyCombos}
        onAddKeyCombo={handleAddKeyCombo}
        onRemoveKeyCombo={handleRemoveKeyCombo}
      />
    </>
  );
};

export default KeyCombinations; 