import { atom } from 'recoil';
import { TestCase } from '../types';

export const testCasesAtom = atom<TestCase[]>({
  key: 'testCasesState',
  default: [],
}); 