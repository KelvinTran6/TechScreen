import { atom } from 'recoil';
import { ActivityItem } from '../types/ActivityTypes';

export const candidateActivitiesAtom = atom<ActivityItem[]>({
  key: 'candidateActivitiesState',
  default: [],
}); 