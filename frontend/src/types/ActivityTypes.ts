export interface ActivityItem {
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

export interface ActivityOverlayProps {
  activities: ActivityItem[];
  onActivityExpired: (id: string) => void;
} 