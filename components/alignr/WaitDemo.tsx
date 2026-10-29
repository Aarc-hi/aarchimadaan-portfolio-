import React, { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '../research/shared';

// Two graphs explaining the delay: how far the back leans over time. The dashed line is the lean the device treats as slouching.
// On the left a short slouch (bending to pick something up) crosses it but never stays above it long enough to count.
// On the right a real slouch stays above it until the 6 seconds are up, so the device buzzes. Both play the same loop, in real time,
// and each graph is drawn as it happens.
const INK = '#1A1A1A';
const COBALT = '#2A52BE';
const THRESHOLD = 20;     // degrees of lean the device treats as slouching
const WAIT = 6;           // seconds of slouching before it buzzes
const BUZZ = 3;           // how long it buzzes
const LOOP = 13;          // seconds before the whole thing starts again
const LEAN = 34;

const sm = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };

// how far each person leans at time t
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

// the graph (the same box the two stick figures were in: 330 x 240)
const X0 = 36, X1 = 326, YB = 252, K = 5;               // left, right, baseline, pixels per degree
const gx = (s: number) => X0 + (s / LOOP) * (X1 - X0);
const gy = (l: number) => YB - l * K;
const YT = gy(THRESHOLD);

const Graph: React.FC<{ lean: (t: number) => number; t: number; run: number; buzzAt: number | null; buzzing: boolean }> = ({ lean, t, run, buzzAt, buzzing }) => {
  const upTo: number[] = [];
  for (let s = 0; s <= t + 1e-6; s += 0.05) upTo.push(s);
  const curve = upTo.map((s, i) => `${i ? 'L' : 'M'}${gx(s).toFixed(1)} ${gy(lean(s)).toFixed(1)}`).join(' ');
  // the stretch above the dashed line is shaded: that is the part that counts as slouching
  const over = upTo.filter((s) => lean(s) > THRESHOLD);
  const area = over.length > 1
    ? `M${gx(over[0]).toFixed(1)} ${YT} ` + over.map((s) => `L${gx(s).toFixed(1)} ${gy(lean(s)).toFixed(1)}`).join(' ') + ` L${gx(over[over.length - 1]).toFixed(1)} ${YT} Z`
    : '';
  const tNow = Math.min(t, LOOP), cx = gx(tNow), cy = gy(lean(tNow));
  const startOver = over.length ? over[0] : null;
  return (
    <svg viewBox="10 40 330 240" className="block w-full h-auto" aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* the axes, and the dashed line at the lean that counts as slouching */}
      <g fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round">
        <path d={`M${X0} ${YB} H${X1}`} />
        <path d={`M${X0} ${YB} V${gy(LEAN) - 10}`} />
      </g>
      <path d={`M${X0} ${YT} H${X1}`} fill="none" stroke={COBALT} strokeWidth="1.3" strokeDasharray="5 4" />
      <g className="font-sans" fontSize="10" fill={INK} fillOpacity="0.7">
        <text x={X0 - 6} y={YB + 4} textAnchor="end">0°</text>
        <text x={X0 - 6} y={YT + 4} textAnchor="end" fill={COBALT} fillOpacity="1">{THRESHOLD}°</text>
        <text x={X0} y={gy(LEAN) - 18}>How far the back leans</text>
        <text x={gx(0)} y={YB + 16} textAnchor="middle">0</text>
        <text x={gx(6)} y={YB + 16} textAnchor="middle">6</text>
        <text x={gx(12)} y={YB + 16} textAnchor="middle">12 s</text>
        <text x={X1} y={YT - 6} textAnchor="end" fill={COBALT} fillOpacity="1">slouching above this line</text>
      </g>
      {area && <path d={area} fill={COBALT} fillOpacity="0.16" />}
      {/* the six seconds that have to pass: a bar above the dashed line that fills as the slouch is held */}
      {startOver !== null && (
        <g stroke={COBALT} strokeWidth="2.2" strokeLinecap="round">
          <path d={`M${gx(startOver)} ${YT - 22} H${gx(startOver + Math.min(run, WAIT))}`} />
          <path d={`M${gx(startOver)} ${YT - 27} V${YT - 17}`} strokeWidth="1.6" />
          {run >= WAIT && <path d={`M${gx(startOver + WAIT)} ${YT - 27} V${YT - 17}`} strokeWidth="1.6" />}
        </g>
      )}
      {startOver !== null && run >= WAIT && <text x={gx(startOver + WAIT / 2)} y={YT - 30} textAnchor="middle" fontSize="10" fill={COBALT} className="font-sans">6 s</text>}
      {/* the line so far, and the point it has reached */}
      <path d={curve} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {buzzAt !== null && <path d={`M${gx(buzzAt)} ${gy(lean(buzzAt))} V${YB}`} stroke={COBALT} strokeWidth="1.3" strokeDasharray="2 4" />}
      <g transform={`translate(${cx} ${cy})`}>
        {buzzing && [0, 1, 2].map((i) => (
          <circle key={i} r="9" fill="none" stroke={COBALT} strokeWidth="1.4" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `waitRipple 1.5s ${i * 0.45}s ease-out infinite` }} />
        ))}
        <circle r={buzzing ? 6.5 : 5} fill={buzzing || lean(tNow) > THRESHOLD ? COBALT : INK} style={{ animation: buzzing ? 'waitShake 90ms linear infinite' : undefined }} />
      </g>
    </svg>
  );
};

const Panel: React.FC<{ n: string; title: string; lean: (t: number) => number; t: number; run: number; buzzAt: number | null; buzzing: boolean; note: string }> = ({ n, title, lean, t, run, buzzAt, buzzing, note }) => (
  <div className="w-full max-w-[320px]">
    <p className="font-sans text-[11px] tracking-wide text-cobalt mb-2 leading-none">{n}</p>
    <p className="font-sans text-lg text-ink leading-snug mb-6 min-h-[2.75em]">{title}</p>
    <Graph lean={lean} t={t} run={run} buzzAt={buzzAt} buzzing={buzzing} />
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
        <Panel n="01" title="A short slouch doesn’t count" lean={shortLean} t={t} run={left.run} buzzAt={left.buzzAt} buzzing={false} note={leftNote} />
        <Panel n="02" title="That’s why it waits 6 seconds to detect a real slouch" lean={realLean} t={t} run={right.run} buzzAt={right.buzzAt} buzzing={rightBuzzing} note={rightNote} />
      </div>
      <style>{`@keyframes waitRipple { from { opacity: .9; transform: scale(1) } to { opacity: 0; transform: scale(3.2) } }
      @keyframes waitShake { 0% { transform: translate(0,0) } 25% { transform: translate(1.2px,-.8px) } 50% { transform: translate(-1.2px,.8px) } 100% { transform: translate(0,0) } }
      @media (prefers-reduced-motion: reduce) { [style*="waitRipple"], [style*="waitShake"] { animation: none !important } }`}</style>
    </div>
  );
};
