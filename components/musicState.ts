import { useSyncExternalStore } from 'react';

// What the magazine's music is doing right now, shared with anything on the page that wants to follow it (the notes that come out of the
// saxophone). The magazine (FlipBook) writes it: whether a sound is really playing, which file it is, and how far into it we are.
let playing = false;
let src: string | null = null;
let getTime: () => number = () => 0;
const listeners = new Set<() => void>();

export const setMusic = (isPlaying: boolean, file: string | null, time?: () => number) => {
  if (time) getTime = time;
  src = file;
  if (playing !== isPlaying) { playing = isPlaying; listeners.forEach((l) => l()); }
};
export const useMusicPlaying = () => useSyncExternalStore(
  (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
  () => playing,
  () => false,
);
// the file that is playing and how many seconds into it (read on demand, not stored in React state)
export const readMusic = () => ({ src, time: getTime() });
