import React, { useEffect, useRef, useState } from 'react';

// A note for the market-sound spread of the Thela Thaila Thikana zine (spread 2): a line of text outside the book and a curvy arrow
// sweeping into the page, drawn the same way as the parking page's. It sits in the margin right of the book when there is room,
// and above the book when there is not.
export const SoundHint: React.FC = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 637 });
  const [room, setRoom] = useState(0);
  useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const measure = () => { setSize({ w: el.clientWidth, h: el.clientHeight }); setRoom(document.documentElement.clientWidth - el.getBoundingClientRect().right - 16); };
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener('resize', measure); measure();
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const SIDE_GAP = 28, SIDE_MIN = 120;
  const wide = room - SIDE_GAP >= SIDE_MIN;
  const sideW = Math.min(175, room - SIDE_GAP);

  const textBottom = size.h * 0.27;
  const arrow = (() => {
    if (!wide) return { line: 'M 905 -26 C 996 22, 900 80, 880 150', head: 'M 876 134 L 880 150 L 865 143' };
    const S = { x: size.w + 34, y: textBottom + 12 };
    const E = { x: size.w * 0.9, y: S.y + size.h * 0.17 };   // the same sweep as the parking page's arrow
    const C1 = { x: S.x + 26, y: S.y + 62 }, C2 = { x: E.x + 96, y: E.y + 30 };
    const dx = E.x - C2.x, dy = E.y - C2.y, len = Math.hypot(dx, dy), bx = -dx / len, by = -dy / len;
    const rot = (a: number) => ({ x: E.x + 15 * (bx * Math.cos(a) - by * Math.sin(a)), y: E.y + 15 * (bx * Math.sin(a) + by * Math.cos(a)) });
    const a = rot((28 * Math.PI) / 180), b = rot((-28 * Math.PI) / 180);
    return { line: `M ${S.x} ${S.y} C ${C1.x} ${C1.y}, ${C2.x} ${C2.y}, ${E.x} ${E.y}`, head: `M ${a.x} ${a.y} L ${E.x} ${E.y} L ${b.x} ${b.y}` };
  })();

  return (
    <div ref={boxRef} className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 5 }}>
      <div className="absolute font-sans"
        style={wide
          ? { left: size.w + SIDE_GAP, bottom: size.h - textBottom, width: sideW, textAlign: 'left', fontSize: 14, lineHeight: 1.35, color: '#2A52BE' }
          : { right: '3%', bottom: 'calc(100% + 12px)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'clamp(11px, 1.45vw, 14px)', lineHeight: 1.3, color: '#2A52BE' }}>
        Listen closely, this page has the sound of the market.
      </div>
      <svg aria-hidden="true" viewBox={wide ? `0 0 ${size.w} ${size.h}` : '0 0 1024 725'} className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <g fill="none" stroke="#2A52BE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={arrow.line} pathLength="1" strokeDasharray="1" style={{ animation: 'soundArrow 800ms 200ms cubic-bezier(.4,0,.2,1) both' }} />
          <path d={arrow.head} pathLength="1" strokeDasharray="1" style={{ animation: 'soundArrow 220ms 900ms ease-out both' }} />
        </g>
      </svg>
      <style>{`@keyframes soundArrow { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
      @media (prefers-reduced-motion: reduce) { [style*="soundArrow"] { animation: none !important } }`}</style>
    </div>
  );
};
