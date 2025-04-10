import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ActivityItem {
  id: string;
  type: 'keypress' | 'mouseclick';
  key?: string;
  x?: number;
  y?: number;
  target?: string;
  button?: number;
  timestamp: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  isHighlighted?: boolean;
  isRegularTyping?: boolean;
}

interface CandidateActivityOverlayProps {
  activities: ActivityItem[];
  onActivityExpired: (id: string) => void;
}

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

const MouseButton = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '50px',
  height: '50px',
  margin: '0 10px',
  padding: '0 15px',
  borderRadius: '8px',
  backgroundColor: 'rgba(33, 150, 243, 0.3)',
  border: '2px solid rgba(33, 150, 243, 0.7)',
  color: '#2196F3',
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '16px',
  fontWeight: 'bold',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease-out',
}));

const ActivityContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  userSelect: 'none',
  width: '500px',
  height: '120px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
}));

const DragHandle = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '20px',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'move',
  '&:hover': {
    '&::before': {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    }
  },
  '&::before': {
    content: '""',
    width: '40px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '2px',
    transition: 'background-color 0.2s ease',
  }
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
}));

const CandidateActivityOverlay: React.FC<CandidateActivityOverlayProps> = ({ 
  activities, 
  onActivityExpired 
}) => {
  // State to track position
  const [position, setPosition] = useState(() => {
    // Try to load saved position from localStorage
    const savedPosition = localStorage.getItem('activityOverlayPosition');
    if (savedPosition) {
      try {
        return JSON.parse(savedPosition);
      } catch (e) {
        console.error('Failed to parse saved position:', e);
      }
    }
    return { x: 0, y: 0 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedActivities, setDisplayedActivities] = useState<ActivityItem[]>([]);
  const globalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Define highlighted key combinations
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

  // Update displayed activities and reset the global timer whenever activities change
  useEffect(() => {
    // Get the most recent activities
    const recentActivities = [...activities].slice(-5);
    
    // Process activities to only include highlighted key combinations
    const processedActivities = recentActivities.reduce<ActivityItem[]>((acc, activity) => {
      if (activity.type === 'keypress') {
        // Check if this is a highlighted key combination
        const isHighlighted = highlightedKeyCombos.some(combo => 
          combo.key === activity.key && 
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

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('activityOverlayPosition', JSON.stringify(position));
    }
  }, [position]);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if the left mouse button is pressed
    if (e.button !== 0) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle mouse move event to update position while dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners for mouse move and mouse up
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

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

  // Determine if we should use the saved position or center the overlay
  const hasCustomPosition = position.x !== 0 || position.y !== 0;

  return (
    <ActivityContainer 
      ref={containerRef}
      style={{
        transform: isDragging 
          ? `translate(${position.x}px, ${position.y}px)` 
          : hasCustomPosition 
            ? `translate(${position.x}px, ${position.y}px)` 
            : 'translate(-50%, -50%)',
        top: isDragging || hasCustomPosition ? '0' : '50%',
        left: isDragging || hasCustomPosition ? '0' : '50%',
      }}
    >
      <DragHandle onMouseDown={handleMouseDown} />
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
      </ActivityRow>
    </ActivityContainer>
  );
};

export default CandidateActivityOverlay;