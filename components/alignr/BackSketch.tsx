import React from 'react';

// A hand-drawn style sketch of a person seen from the back, wearing one of the ways the sensor was tried.
// Every variant uses the same body, so the sketches can be compared; the thing being worn is drawn in blue.
export type Wear = 'neckband' | 'belt' | 'velcro' | 'final';

const INK = '#1A1A1A';
const BLUE = '#2A52BE';
const PAPER = '#FFFDF5';

const Body: React.FC = () => (
  <g fill={PAPER} stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85">
    {/* torso, then neck and head (no arms, so the worn thing is easy to see) */}
    <path d="M86 86 C70 88 52 92 40 102 C48 118 58 118 62 110 C60 138 64 168 68 196 L132 196 C136 168 140 138 138 110 C142 118 152 118 160 102 C148 92 130 88 114 86 Z" />
    <path d="M88 64 C88 74 87 80 86 88 C94 94 106 94 114 88 C113 80 112 74 112 64 Z" />
    <ellipse cx="100" cy="40" rx="23" ry="27" />
    <path d="M80 34 C82 20 92 14 100 14 C108 14 118 20 120 34" strokeOpacity="0.5" />
  </g>
);

// the spine, as a faint dotted line, and the shoulder blades, so the placement can be read
const Hints: React.FC = () => (
  <g fill="none" stroke={INK} strokeOpacity="0.28" strokeWidth="1.2" strokeLinecap="round">
    <path d="M100 92 V194" strokeDasharray="1 5" />
    <path d="M74 120 C70 134 76 148 90 150" />
    <path d="M126 120 C130 134 124 148 110 150" />
  </g>
);

const Blue: React.FC<{ children: React.ReactNode; fill?: string; w?: number }> = ({ children, fill = 'none', w = 2.4 }) => (
  <g fill={fill} stroke={BLUE} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{children}</g>
);
const Device: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 20, h = 26 }) => (
  <rect x={x} y={y} width={w} height={h} rx="6" fill={BLUE} stroke={BLUE} />
);

export const BackSketch: React.FC<{ wear: Wear; className?: string; label?: string }> = ({ wear, className, label }) => (
  <svg viewBox="38 10 124 196" className={className} role="img" aria-label={label ?? `Sketch of a person from the back, wearing the ${wear}`}>
    <defs>
      {/* a little wobble, so the lines look drawn by hand */}
      <filter id="alignr-rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
      </filter>
    </defs>
    <g filter="url(#alignr-rough)">
      <Body />
      <Hints />

      {wear === 'neckband' && (<>
        <Blue w={5}><path d="M85 88 C89 106 111 106 115 88" /></Blue>
        <Blue w={2}><path d="M83 86 C87 109 113 109 117 86" strokeOpacity="0.5" /></Blue>
        <Device x={91} y={99} w={18} h={16} />
      </>)}

      {wear === 'belt' && (<>
        {/* a harness: two straps over the shoulders to a pad on the upper back, and a belt round the waist */}
        <Blue w={4}><path d="M72 90 C74 110 84 124 96 136" /><path d="M128 90 C126 110 116 124 104 136" /></Blue>
        <Blue fill="rgba(42,82,190,0.12)" w={2}><rect x="82" y="112" width="36" height="34" rx="10" /></Blue>
        <Device x={91} y={118} w={18} h={22} />
        <Blue w={4}><path d="M92 146 C90 160 86 172 76 186" /><path d="M108 146 C110 160 114 172 124 186" /></Blue>
        <Blue w={5}><path d="M64 186 C84 192 116 192 136 186" /></Blue>
      </>)}

      {wear === 'velcro' && (<>
        {/* a Velcro patch on the clothes at the upper back (the soft side, drawn dotted) with the device pressed onto it, and its two tabs peeling at the sides */}
        <Blue fill="rgba(42,82,190,0.10)" w={1.6}><rect x="82" y="108" width="36" height="42" rx="6" /></Blue>
        <Blue w={1.4}><path d="M88 116 H112 M88 124 H112 M88 132 H112 M88 140 H112" strokeDasharray="1 3.2" /></Blue>
        <Device x={91} y={116} w={18} h={26} />
        <Blue w={2}><path d="M82 150 C76 154 74 160 78 164" /><path d="M118 150 C124 154 126 160 122 164" /></Blue>
      </>)}

      {wear === 'final' && (<>
        {/* the idea in use: one small device on the upper back, where slouching begins, with a bracket on the T6 to T8 stretch of the spine */}
        <Blue w={1.4}><path d="M114 108 H120 V148 H114" /></Blue>
        <Device x={89} y={112} w={22} h={30} />
      </>)}
    </g>
  </svg>
);
