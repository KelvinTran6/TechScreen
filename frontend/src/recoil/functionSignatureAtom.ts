import { atom } from 'recoil';
import { Parameter } from '../types';

export const parametersAtom = atom<Parameter[]>({
  key: 'parametersState',
  default: [],
});

export const returnTypeAtom = atom<string>({
  key: 'returnTypeState',
  default: '',
}); 