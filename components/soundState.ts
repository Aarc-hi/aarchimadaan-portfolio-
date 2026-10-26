import { useSyncExternalStore } from 'react';

// Whether the site's sound is switched off. One switch for the whole site (the button in the top nav); the viewer's choice is remembered.
const KEY = 'aarchi-sound-off';
let muted = false;
try { muted = localStorage.getItem(KEY) === '1'; } catch { /* no storage: the sound simply starts on */ }

const listeners = new Set<() => void>();
export const setMuted = (value: boolean) => {
  muted = value;
  try { localStorage.setItem(KEY, value ? '1' : '0'); } catch { /* ignore */ }
  listeners.forEach((l) => l());
};
export const useMuted = () => useSyncExternalStore(
  (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
  () => muted,
  () => false,
);
