import { atom } from 'recoil';

export const codeAtom = atom<string>({
  key: 'codeState',
  default: '',
}); 