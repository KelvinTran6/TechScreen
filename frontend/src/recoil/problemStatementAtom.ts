import { atom } from 'recoil';

export const problemStatementAtom = atom<string>({
  key: 'problemStatementState',
  default: '',
}); 