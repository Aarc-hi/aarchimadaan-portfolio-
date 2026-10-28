import React from 'react';

// Small drawings of a fountain pen, used by the patient files and the repair game.
export const PEN_INK = '#1A1A1A';
export const PEN_BLUE = '#2A52BE';

// A whole pen lying flat, pointing right. `color` is the barrel colour.
export const PenShape: React.FC<{ color?: string; className?: string; style?: React.CSSProperties }> = ({ color = PEN_INK, className, style }) => (
  <svg viewBox="0 0 240 40" className={className} style={style} aria-hidden="true">
    <rect x="2" y="9" width="62" height="22" rx="8" fill={color} />                       {/* the cap, posted on the end */}
    <rect x="66" y="12" width="104" height="16" rx="7" fill={color} />                    {/* the barrel */}
    <path d="M170 14 H196 L206 20 L196 26 H170 Z" fill={color} fillOpacity="0.75" />       {/* the grip */}
    <path d="M206 20 L238 20 L214 14 Z M206 20 L238 20 L214 26 Z" fill={color} />          {/* the nib */}
    <circle cx="214" cy="20" r="1.6" fill="#FFFDF5" />
  </svg>
);
