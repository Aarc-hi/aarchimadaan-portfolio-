import React, { useEffect, useRef, useState } from 'react';

// One stick figure at a desk. Drag it (or use the arrow keys) to change how far it leans. Past the threshold the device on its upper back
// starts counting; if the figure stays slouched until the ring is full the device buzzes, and it stops once the figure sits up.
// The real device waits 6 seconds; here the wait is shortened so it can be felt.
const HIP = { x: 112, y: 182 };
const TORSO = 88;
const MAX = 56;          // degrees of lean
const THRESHOLD = 20;    // the device's slouch threshold
const WAIT_MS = 2600;    // the demo wait (6 s on the real device)
const BUZZ_MS = 3000;    // how long the device buzzes
const RISE_MS = 1300;    // how long the figure takes to sit back up once it buzzes
const REST_MS = 1200;    // how long they stay upright before sinking again
const SINK_MS = 6000;    // how slowly they sink back down
const SLUMP = 34;        // how far they sink
const INK = '#1A1A1A';
const COBALT = '#2A52BE';

const rad = (d: number) => (d * Math.PI) / 180;

export const SlouchFigure: React.FC<{ className?: string }> = ({ className }) => {
  const [lean, setLean] = useState(34);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);   // 0..1 of the wait
  const [touched, setTouched] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const since = useRef<number | null>(null);

  const [buzzing, setBuzzing] = useState(false);
  const leanRef = useRef(lean); leanRef.current = lean;
  const rise = useRef(0);        // the animation that sits the figure back up (and the one that sinks it again)
  const slumpTimer = useRef(0);
  useEffect(() => () => { cancelAnimationFrame(rise.current); window.clearTimeout(slumpTimer.current); }, []);
  const slouching = lean > THRESHOLD;

  // The wait is over: the device buzzes for a few seconds, and the figure sits back up as it does.
  useEffect(() => {
    if (!slouching || progress < 1 || buzzing) return;
    setBuzzing(true);
    window.setTimeout(() => setBuzzing(false), BUZZ_MS);
    const from = performance.now() + 450, t0 = leanRef.current;
    const tick = () => {
      const k = Math.max(0, Math.min(1, (performance.now() - from) / RISE_MS));
      setLean(t0 * (1 - k * k * (3 - 2 * k)));
      if (k < 1) { rise.current = requestAnimationFrame(tick); return; }
      // sat up: after a moment they slowly sink back into the slouch, and the whole thing starts again
      slumpTimer.current = window.setTimeout(() => {
        const s0 = performance.now();
        const sink = () => {
          const j = Math.min(1, (performance.now() - s0) / SINK_MS);
          setLean(SLUMP * (j * j * (3 - 2 * j)));
          if (j < 1) rise.current = requestAnimationFrame(sink);
        };
        rise.current = requestAnimationFrame(sink);
      }, REST_MS);
    };
    rise.current = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slouching, progress >= 1]);
  useEffect(() => { if (!slouching) setProgress(0); }, [slouching]);

  useEffect(() => {
    if (!slouching) { since.current = null; setProgress(0); return; }
    if (since.current === null) since.current = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - (since.current ?? performance.now())) / WAIT_MS);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [slouching]);

  useEffect(() => { if (buzzing && touched && navigator.userActivation?.hasBeenActive !== false) { try { navigator.vibrate?.([60, 40, 60]); } catch { /* not supported */ } } }, [buzzing, touched]);

  const toLean = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = 10 + ((e.clientX - r.left) / r.width) * 330, y = 40 + ((e.clientY - r.top) / r.height) * 240;
    const a = (Math.atan2(x - HIP.x, HIP.y - y) * 180) / Math.PI;
    setLean(Math.max(0, Math.min(MAX, a)));
  };

  // the body, built from the lean
  const t = rad(lean), h = rad(lean * 1.45);                        // the head leads the torso a little
  const S = { x: HIP.x + TORSO * Math.sin(t), y: HIP.y - TORSO * Math.cos(t) };         // shoulders
  const Hd = { x: S.x + 28 * Math.sin(h), y: S.y - 28 * Math.cos(h) };                 // head centre
  const E = { x: S.x + 22, y: S.y + 40 };                                               // elbow
  const D = { x: 226, y: 150 };                                                         // hand on the desk
  const P = { x: HIP.x + 0.68 * TORSO * Math.sin(t) - 7 * Math.cos(t), y: HIP.y - 0.68 * TORSO * Math.cos(t) - 7 * Math.sin(t) };   // the device, on the back

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg ref={svgRef} viewBox="10 40 330 240" role="slider" tabIndex={0} aria-label="How far the stick figure leans forward"
        aria-valuemin={0} aria-valuemax={MAX} aria-valuenow={Math.round(lean)}
        onPointerDown={(e) => { cancelAnimationFrame(rise.current); window.clearTimeout(slumpTimer.current); (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); setDragging(true); setTouched(true); toLean(e); }}
        onPointerMove={(e) => { if (dragging) toLean(e); }}
        onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setLean((v) => Math.max(0, v - 4)); setTouched(true); e.preventDefault(); }
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setLean((v) => Math.min(MAX, v + 4)); setTouched(true); e.preventDefault(); }
        }}
        className="block w-full h-auto touch-none select-none outline-none" style={{ cursor: dragging ? 'grabbing' : 'grab', overflow: 'visible' }}>
        {/* the floor, chair and desk */}
        <g fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 272 H330" strokeOpacity="0.5" />
          <path d="M70 190 H150 M72 190 V272 M148 190 V272 M72 190 V120" />
          <path d="M210 150 H336 M300 150 V272" />
        </g>

        {/* the stick figure */}
        <g fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${HIP.x} ${HIP.y} L186 182 L190 264`} />                           {/* thigh and shin */}
          <path d={`M${S.x} ${S.y} L${E.x} ${E.y} L${D.x} ${D.y}`} />                    {/* arm */}
          <path d={`M${HIP.x} ${HIP.y} L${S.x} ${S.y}`} />                               {/* spine */}
          <circle cx={Hd.x} cy={Hd.y} r="13" fill="#FFFDF5" />                           {/* head */}
        </g>

        {/* the device, on the upper back */}
        <g transform={`translate(${P.x} ${P.y})`} style={{ animation: buzzing ? 'alignrShake 90ms linear infinite' : undefined }}>
          {buzzing && [0, 1, 2].map((i) => (
            <circle key={i} r="12" fill="none" stroke={COBALT} strokeWidth="1.4" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `alignrRipple 1.5s ${i * 0.45}s ease-out infinite` }} />
          ))}
          <g transform={`rotate(${lean})`}><rect x="-6" y="-10" width="12" height="20" rx="4" fill={COBALT} /></g>
          {slouching && !buzzing && (
            <circle r="18" fill="none" stroke={COBALT} strokeWidth="1.8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - progress)} transform="rotate(-90)" />
          )}
        </g>
      </svg>

      {/* the caption hangs below the drawing (it takes no height), starting where the floor line starts, so the floor can line up with the text beside it */}
      <p className="absolute top-full left-[3%] mt-2 font-sans text-[11px] tracking-wide leading-snug whitespace-nowrap" aria-live="polite" style={{ color: COBALT }}>
        {buzzing ? 'Buzz. The device nudges them to sit up.'
          : slouching ? 'Slouching. The device is waiting to be sure.'
          : 'Sitting straight. Drag them forward to slouch again.'}
      </p>
      <style>{`@keyframes alignrRipple { from { opacity: .9; transform: scale(1) } to { opacity: 0; transform: scale(3.2) } }
      @keyframes alignrShake { 0% { transform: translate(${P.x}px, ${P.y}px) } 25% { transform: translate(${P.x + 1.2}px, ${P.y - 0.8}px) } 50% { transform: translate(${P.x - 1.2}px, ${P.y + 0.8}px) } 100% { transform: translate(${P.x}px, ${P.y}px) } }
      @media (prefers-reduced-motion: reduce) { [style*="alignrRipple"], [style*="alignrShake"] { animation: none !important } }`}</style>
    </div>
  );
};
