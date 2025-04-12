import { atom } from 'recoil';

export const sessionIdAtom = atom<string | null>({
  key: 'sessionIdState',
  default: null,
});

export const roleAtom = atom<'interviewer' | 'interviewee' | null>({
  key: 'roleState',
  default: null,
});

export const isInterviewerAtom = atom<boolean>({
  key: 'isInterviewerState',
  default: false,
}); 