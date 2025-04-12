import { atom } from 'recoil';

export const loadingAtom = atom<boolean>({
  key: 'loadingState',
  default: false,
});

export const errorAtom = atom<string | null>({
  key: 'errorState',
  default: null,
});

export const containerHeightAtom = atom<number>({
  key: 'containerHeightState',
  default: window.innerHeight - 64,
});

export const descriptionWidthAtom = atom<number>({
  key: 'descriptionWidthState',
  default: 400,
});

export const codeEditorHeightAtom = atom<number>({
  key: 'codeEditorHeightState',
  default: Math.floor((window.innerHeight - 64) * 0.5),
}); 