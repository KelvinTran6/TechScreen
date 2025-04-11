import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { ActivityItem, ActivityOverlayProps } from '../types/ActivityTypes';
import KeyCombinations from './KeyCombinations';
import CodeComparison from './CodeComparison';

// Styled components
const ActivityOverlayContainer = styled('div')<{ isDragging: boolean }>(({ theme, isDragging }) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  width: '400px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: '8px',
  padding: '12px',
  color: 'white',
  fontFamily: 'monospace',
  fontSize: '14px',
  zIndex: 1000,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  cursor: isDragging ? 'grabbing' : 'grab',
  userSelect: 'none',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
  },
}));

const ActivityHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '4px',
  height: '20px',
  overflow: 'hidden',
}));

const DragHandle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '20px',
  cursor: 'grab',
  '&::before': {
    content: '""',
    display: 'block',
    width: '40px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '2px',
    transition: 'background-color 0.2s ease',
  },
  '&:hover::before': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  marginBottom: '12px',
  marginTop: '0px',
  minHeight: '36px',
  '& .MuiTabs-indicator': {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '12px',
    minHeight: '36px',
    padding: '4px 8px',
    '&.Mui-selected': {
      color: 'white',
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 'auto',
  padding: '4px 8px',
  fontSize: '12px',
  minHeight: '36px',
}));

const CandidateActivityOverlay: React.FC<ActivityOverlayProps> = ({ 
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
    return { x: 20, y: 20 }; // Default position
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('activityOverlayPosition', JSON.stringify(position));
    }
  }, [position]);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start dragging if clicking on the header or container
    if (e.target === containerRef.current || 
        (e.target as HTMLElement).closest('.activity-header') ||
        (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle window mouse move event
  const handleWindowMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setDragOffset({ x: dx, y: dy });
    }
  };

  // Handle window mouse up event
  const handleWindowMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setPosition({
        x: position.x + dragOffset.x,
        y: position.y + dragOffset.y
      });
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Add and remove event listeners for mouse move and mouse up
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, dragStart, position, dragOffset]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <ActivityOverlayContainer
      ref={containerRef}
      isDragging={isDragging}
      style={{
        transform: isDragging 
          ? `translate(${position.x + dragOffset.x}px, ${position.y + dragOffset.y}px)` 
          : `translate(${position.x}px, ${position.y}px)`,
        paddingTop: '4px',
      }}
      onMouseDown={handleMouseDown}
    >
      <ActivityHeader className="activity-header">
        <DragHandle className="drag-handle" />
      </ActivityHeader>

      <StyledTabs 
        value={activeTab} 
        onChange={handleTabChange} 
        aria-label="candidate activity tabs"
        variant="fullWidth"
      >
        <StyledTab label="Key Combinations" />
        <StyledTab label="Code Comparison" />
      </StyledTabs>

      {activeTab === 0 ? (
        <KeyCombinations 
          activities={activities} 
          onActivityExpired={onActivityExpired} 
        />
      ) : (
        <CodeComparison 
          activities={activities} 
          onActivityExpired={onActivityExpired} 
        />
      )}
    </ActivityOverlayContainer>
  );
};

export default CandidateActivityOverlay;