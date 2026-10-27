import React from 'react';

// Tiny people. One drawing, a few variants (a backpack, a cane, a headset), used for the numbers and for the target audience.
export type Kind = 'adult' | 'student' | 'elder' | 'gamer';

export const Person: React.FC<{ kind?: Kind; color: string; opacity?: number; size?: number; delay?: number }> = ({ kind = 'adult', color, opacity = 1, size = 22, delay = 0 }) => (
  <svg viewBox="0 0 10 20" width={size * 0.5} height={size} aria-hidden="true" style={{ opacity, transition: `opacity 250ms ease, fill 450ms ease ${delay}ms` }} fill={color}>
    <circle cx="5" cy="3" r="2.4" />
    <rect x="2.2" y="6.2" width="5.6" height="7.6" rx="2.6" />
    <rect x="2.7" y="12.6" width="2" height="6.8" rx="1" />
    <rect x="5.3" y="12.6" width="2" height="6.8" rx="1" />
    {kind === 'student' && <rect x="0.4" y="6.8" width="2.4" height="5.4" rx="1" />}
    {kind === 'elder' && <path d="M8.6 9.4 L8.6 19.6" stroke={color} strokeWidth="0.9" strokeLinecap="round" fill="none" />}
    {kind === 'gamer' && <path d="M2.3 3.2 A2.7 2.9 0 0 1 7.7 3.2" stroke={color} strokeWidth="0.9" fill="none" />}
  </svg>
);
