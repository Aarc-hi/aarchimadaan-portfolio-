import React, { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '../research/shared';

// Two stick figures explaining the delay. On the left a short slouch (bending to pick something up) never lasts long enough to count.
// On the right a real slouch is held until the 6 seconds are up, so the device buzzes. Both play the same loop, in real time.
const INK = '#1A1A1A';
const COBALT = '#2A52BE';
const THRESHOLD = 20;     // degrees of lean the device treats as slouching
const WAIT = 6;           // seconds of slouching before it buzzes
const BUZZ = 3;           // how long it buzzes
const LOOP = 13;          // seconds before the whole thing starts again
const LEAN = 34;
const HIP = { x: 112, y: 182 };
const TORSO = 88;

const sm = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };
const rad = (d: number) => (d * Math.PI) / 180;

// how far each figure leans at time t
const shortLean = (t: number) => LEAN * sm(t - 1) * (1 - sm((t - 3.6) / 1));            // down for about 3 seconds, then back up
const realLean = (t: number) => LEAN * sm(t - 1) * (1 - sm((t - 10.6) / 1.2));           // down and held until the buzz is over

// how long the lean has been over the threshold, and when (if ever) the wait ran out
const track = (lean: (t: number) => number, t: number) => {
  let run = 0, buzzAt: number | null = null;
  for (let s = 0; s <= t + 1e-6; s += 0.05) {
    if (lean(s) > THRESHOLD) { run += 0.05; if (run >= WAIT && buzzAt === null) buzzAt = s; } else run = 0;
  }
  return { run, buzzAt };
};

const Figure: React.FC<{ lean: number; progress: number; buzzing: boolean }> = ({ lean, progress, buzzing }) => {
  const t = rad(lean), h = rad(lean * 1.45);
  const S = { x: HIP.x + TORSO * Math.sin(t), y: HIP.y - TORSO * Math.cos(t) };
  const Hd = { x: S.x + 28 * Math.sin(h), y: S.y - 28 * Math.cos(h) };
  const E = { x: S.x + 22, y: S.y + 40 };
  const D = { x: 226, y: 150 };
  const P = { x: HIP.x + 0.68 * TORSO * Math.sin(t) - 7 * Math.cos(t), y: HIP.y - 0.68 * TORSO * Math.cos(t) - 7 * Math.sin(t) };
  const ring = 2 * Math.PI * 18;
  return (
    <svg viewBox="10 40 330 240" className="block w-full h-auto" aria-hidden="true" style={{ overflow: 'visible' }}>
      <g fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 272 H330" strokeOpacity="0.5" />
        <path d="M70 190 H150 M72 190 V272 M148 190 V272 M72 190 V120" />
        <path d="M210 150 H336 M300 150 V272" />
      </g>
      <g fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${HIP.x} ${HIP.y} L186 182 L190 264`} />
        <path d={`M${S.x} ${S.y} L${E.x} ${E.y} L${D.x} ${D.y}`} />
        <path d={`M${HIP.x} ${HIP.y} L${S.x} ${S.y}`} />
        <circle cx={Hd.x} cy={Hd.y} r="13" fill="#FFFDF5" />
      </g>
      <g transform={`translate(${P.x} ${P.y})`}><g style={{ animation: buzzing ? 'waitShake 90ms linear infinite' : undefined }}>
        {buzzing && [0, 1, 2].map((i) => (
          <circle key={i} r="12" fill="none" stroke={COBALT} strokeWidth="1.4" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `waitRipple 1.5s ${i * 0.45}s ease-out infinite` }} />
        ))}
        <g transform={`rotate(${lean})`}><rect x="-6" y="-10" width="12" height="20" rx="4" fill={COBALT} /></g>
        {lean > THRESHOLD && !buzzing && progress > 0 && (
          <circle r="18" fill="none" stroke={COBALT} strokeWidth="1.8" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} transform="rotate(-90)" />
        )}
      </g></g>
    </svg>
  );
};

const Panel: React.FC<{ n: string; title: string; lean: number; run: number; buzzing: boolean; note: string }> = ({ n, title, lean, run, buzzing, note }) => (
  <div className="w-full max-w-[320px]">
    <p className="font-sans text-[11px] tracking-wide text-cobalt mb-2 leading-none">{n}</p>
    <p className="font-sans text-lg text-ink leading-snug mb-6 min-h-[2.75em]">{title}</p>
    <Figure lean={lean} progress={Math.min(1, run / WAIT)} buzzing={buzzing} />
    <div className="mt-6">
      <div className="flex justify-between font-sans text-[11px] tracking-wide mb-1.5"><span>SLOUCHED FOR</span><span>{Math.min(run, WAIT).toFixed(0)} / {WAIT} s</span></div>
      <div className="h-1.5 bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-cobalt rounded-full" style={{ width: `${Math.min(1, run / WAIT) * 100}%` }} /></div>
      <p className="font-sans text-lg leading-relaxed mt-4 min-h-[3.4em]" style={{ color: buzzing ? COBALT : undefined }}>{note}</p>
    </div>
  </div>
);

export const WaitDemo: React.FC = () => {
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.3);
  const [t, setT] = useState(0);
  const t0 = useRef(0);
  useEffect(() => {
    if (!seen) return;
    t0.current = performance.now();
    let raf = 0;
    const tick = () => { setT(((performance.now() - t0.current) / 1000) % LOOP); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen]);

  const left = track(shortLean, t), right = track(realLean, t);
  const rightBuzzing = right.buzzAt !== null && t < right.buzzAt + BUZZ;
  const leftNote = shortLean(t) > THRESHOLD ? 'Bending down to pick something up…' : t > 4 ? 'Back up in time. Nothing happens.' : 'Sitting fine.';
  const rightNote = rightBuzzing ? 'Six seconds. This is a real slouch, so the device buzzes.'
    : realLean(t) > THRESHOLD ? 'Still slouching, so the device keeps counting…' : t > 11 ? 'Sitting up again.' : 'Sitting fine.';

  return (
    <div ref={ref}>
      <div className="grid md:grid-cols-[320px_320px] md:justify-center justify-items-center gap-14 md:gap-12 lg:gap-64 items-start">
        <Panel n="01" title="A short slouch doesn’t count" lean={shortLean(t)} run={left.run} buzzing={false} note={leftNote} />
        <Panel n="02" title="That’s why it waits 6 seconds to detect a real slouch" lean={realLean(t)} run={right.run} buzzing={rightBuzzing} note={rightNote} />
      </div>
      <style>{`@keyframes waitRipple { from { opacity: .9; transform: scale(1) } to { opacity: 0; transform: scale(3.2) } }
      @keyframes waitShake { 0% { transform: translate(0,0) } 25% { transform: translate(1.2px,-.8px) } 50% { transform: translate(-1.2px,.8px) } 100% { transform: translate(0,0) } }
      @media (prefers-reduced-motion: reduce) { [style*="waitRipple"], [style*="waitShake"] { animation: none !important } }`}</style>
    </div>
  );
};
