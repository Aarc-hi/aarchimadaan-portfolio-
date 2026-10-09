import React from 'react';

// [x, y, height] of each bar, taken from the Spotify code SVG for the playlist.
const BARS: [number, number, number][] = [
  [100.0, 44.5, 11], [112.42, 37.5, 25], [124.84, 27, 46], [137.27, 37.5, 25],
  [149.69, 30.5, 39], [162.11, 27, 46], [174.53, 41, 18], [186.96, 37.5, 25],
  [199.38, 20, 60], [211.8, 44.5, 11], [224.22, 37.5, 25], [236.64, 20, 60],
  [249.07, 20, 60], [261.49, 23.5, 53], [273.91, 34, 32], [286.33, 20, 60],
  [298.76, 23.5, 53], [311.18, 44.5, 11], [323.6, 20, 60], [336.02, 30.5, 39],
  [348.44, 20, 60], [360.87, 20, 60], [373.29, 44.5, 11],
];

export const SpotifyCode: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="100 20 280 60" className={className} aria-hidden="true">
    {BARS.map(([x, y, h], i) => (
      <rect
        key={i}
        x={x}
        y={y}
        width={6.71}
        height={h}
        rx={3.36}
        className="fill-cobalt group-hover:[animation:code-wave_1s_ease-in-out_both]"
        style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${0.3 + i * 0.035}s` }}
      />
    ))}
  </svg>
);
