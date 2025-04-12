import { atom } from 'recoil';
import { TestResult } from '../types';

export const testResultsAtom = atom<TestResult[]>({
  key: 'testResultsState',
  default: [],
}); 