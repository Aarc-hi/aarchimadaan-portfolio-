import React from 'react';
import { setMuted, useMuted } from './soundState';

// The sound on/off switch in the top nav: a small sine wave that keeps travelling while the sound is on and goes flat when it is off.
// The wave is a strip of three crests behind a 20px window, slid sideways once every 3.5s (the strip repeats, so it never jumps).
export const SoundToggle: React.FC = () => {
  const muted = useMuted();
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'Turn sound on' : 'Mute sound'}
      aria-pressed={!muted}
      className="pointer-events-auto cursor-pointer flex items-center self-center px-1 py-2 hover:text-cobalt transition-colors duration-300"
    >
      <span className="block w-5 overflow-hidden">
        {muted ? (
          <svg width="20" height="9" viewBox="0 0 20 9" fill="none" aria-hidden="true" className="block">
            <path d="M0 4.5L20 4.5" stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10" />
          </svg>
        ) : (
          <svg width="73" height="9" viewBox="0 0 73 9" fill="none" aria-hidden="true" className="block" style={{ animation: 'soundWave 3.5s linear infinite' }}>
            <g stroke="currentColor" strokeWidth="1.2" strokeMiterlimit="10">
              <path d="M0 0.5C3.33 0.5 3.33 8.5 6.66 8.5C9.99 8.5 10 0.5 13.33 0.5C16.66 0.5 16.66 8.5 20 8.5" />
              <path d="M53 0.5C56.33 0.5 56.33 8.5 59.66 8.5C62.99 8.5 63 0.5 66.33 0.5C69.66 0.5 69.66 8.5 73 8.5" />
              <path d="M20 8.50008C22.5 8.50008 23 1.99994 26 1C29 5.50151e-05 29.33 6.50008 32.66 6.50008C35.99 6.50008 36 3.00008 39.33 3.00008C42.66 3.00008 42.66 8 46 8C49 7.99992 49.8 0.5 53 0.5" />
            </g>
          </svg>
        )}
      </span>
      <style>{`@keyframes soundWave { from { transform: translateX(0) } to { transform: translateX(calc(-100% + 20px)) } }
      @media (prefers-reduced-motion: reduce) { [style*="soundWave"] { animation: none !important } }`}</style>
    </button>
  );
};
