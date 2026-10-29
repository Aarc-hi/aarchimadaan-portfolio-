import React, { useEffect, useRef, useState } from 'react';

// A note for the last spread of the Thela Thaila Thikana zine (spread 7), the one with the paan seller. In the printed zine the white shape
// on this spread (the seller's outline) had the scent of paan. A line of text in the margin right of the book and a curvy arrow sweeping
// in from the right into the white part, drawn the same way as the sound page's and the parking page's (SoundHint, ParkingGame).
const BLUE = '#2A52BE';

export const ScentHint: React.FC = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 637 });
  const [room, setRoom] = useState(170);
  useEffect(() => {
    const el = boxRef.current; if (!el) return;
    // the room right of the book is measured up to the edge of the area that scrolls (the page's column), which clips what overhangs it
    let clip: HTMLElement | null = el.parentElement;
    while (clip && !/(auto|scroll)/.test(getComputedStyle(clip).overflowY)) clip = clip.parentElement;
    const measure = () => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
      const edge = clip ? clip.getBoundingClientRect().right - (parseFloat(getComputedStyle(clip).paddingRight) || 0) : document.documentElement.clientWidth;
      setRoom(edge - el.getBoundingClientRect().right);
    };
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener('resize', measure); measure();
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const { w: W, h: H } = size;
  const GAP = 22;
  const textW = Math.max(96, Math.min(175, room - GAP));

  // from the margin on the right, bulging out and sweeping back into the white body of the shape (about 62% across, 70% down)
  const arrow = (() => {
    const S = { x: W + 16, y: H * 0.56 };
    const E = { x: W * 0.62, y: H * 0.7 };
    const C1 = { x: W + 60, y: H * 0.7 }, C2 = { x: W * 0.84, y: H * 0.8 };
    const dx = E.x - C2.x, dy = E.y - C2.y, len = Math.hypot(dx, dy), bx = -dx / len, by = -dy / len;
    const rot = (a: number) => ({ x: E.x + 15 * (bx * Math.cos(a) - by * Math.sin(a)), y: E.y + 15 * (bx * Math.sin(a) + by * Math.cos(a)) });
    const a = rot((28 * Math.PI) / 180), b = rot((-28 * Math.PI) / 180);
    return { line: `M ${S.x} ${S.y} C ${C1.x} ${C1.y}, ${C2.x} ${C2.y}, ${E.x} ${E.y}`, head: `M ${a.x} ${a.y} L ${E.x} ${E.y} L ${b.x} ${b.y}` };
  })();

  return (
    <div ref={boxRef} className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 5 }}>
      <div className="absolute font-sans"
        style={{ left: W + GAP, bottom: H - H * 0.56 + 6, width: textW, textAlign: 'left', fontSize: 14, lineHeight: 1.35, color: BLUE }}>
        In the printed zine, this white cutout smelled of paan.
      </div>
      <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <g fill="none" stroke={BLUE} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d={arrow.line} pathLength="1" strokeDasharray="1" style={{ animation: 'scentArrow 800ms 200ms cubic-bezier(.4,0,.2,1) both' }} />
          <path d={arrow.head} pathLength="1" strokeDasharray="1" style={{ animation: 'scentArrow 220ms 900ms ease-out both' }} />
        </g>
      </svg>
      <style>{`@keyframes scentArrow { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
      @media (prefers-reduced-motion: reduce) { [style*="scentArrow"] { animation: none !important } }`}</style>
    </div>
  );
};
