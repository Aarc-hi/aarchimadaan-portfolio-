import React, { useRef, useState } from 'react';
import { SHADOW_BEATS } from './thelaData';
import { Chapter, glowClass, useEvidence, useJump } from './shared';

const MARKS = [
  { at: 0.16, label: '4:30 PM', note: 'Arrive' },
  { at: 0.33, label: '5:15 PM', note: 'Ready' },
  { at: 0.9, label: 'After sunset', note: 'Still there' },
];

const STOPS = SHADOW_BEATS.map((b) => b.at ?? 0);   // where each moment sits on the evening (the first one is before the evening starts, so it sits at the start)
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const Shadowing: React.FC = () => {
  const { active } = useEvidence();
  const [i, setI] = useState(0);
  const last = SHADOW_BEATS.length - 1;
  const beat = SHADOW_BEATS[i];
  useJump('uncertainty', () => setI(SHADOW_BEATS.findIndex((b) => b.id === 'uncertainty')));

  const go = (n: number) => setI(Math.max(0, Math.min(last, n)));
  const glow = beat.id === 'uncertainty' && active === 3;

  // The evening is a slider that follows the mouse: move along the line and the dot goes with it, and the moment under it shows below
  // (no click needed). Touch drags it. When the mouse leaves, the dot settles on the moment it was last on.
  const line = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState<number | null>(null);   // where the pointer is on the line (0 to 1) while it is over it

  const nearest = (x: number) => STOPS.reduce((best, p, n) => (Math.abs(p - x) < Math.abs(STOPS[best] - x) ? n : best), 0);
  const at = (e: React.PointerEvent) => { const r = line.current!.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width); };
  const scrub = (e: React.PointerEvent) => { const x = at(e); setDragX(x); setI(nearest(x)); };

  const thumb = dragX ?? STOPS[i];

  // Every moment's number, title and text sit in the same place, one on top of the other, and they cross-fade: the old one fades out
  // while the new one fades in at the same time, so nothing blinks off and nothing moves. (The "/ 08" is not part of the fade.)
  const show = (n: number): React.CSSProperties => ({ opacity: n === i ? 1 : 0, transition: 'opacity 450ms ease', pointerEvents: 'none' });

  return (
    <Chapter id="ch-shadowing" n="06" kicker="Shadowing" title="Shadowing"
      intro="Life at **Ahmedabad’s Municipal Market**, from the pavement of C.G. Road. Move along the evening, one moment at a time.">
      <div
        className={`transition-all duration-300 ${glow ? glowClass : ''}`}>
        {/* the evening, 4 PM onwards: the slider */}
        <div ref={line} className="relative h-20 mb-6 md:mb-8 cursor-pointer select-none touch-none"
          onPointerDown={(e) => { if (e.pointerType !== 'mouse') (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); scrub(e); }}
          onPointerMove={scrub}
          onPointerUp={(e) => { if (e.pointerType !== 'mouse') setDragX(null); }}
          onPointerLeave={() => setDragX(null)} onPointerCancel={() => setDragX(null)}>
          <div className="absolute left-0 right-0 top-6 h-px bg-black/20" />
          {MARKS.map((m) => (
            <div key={m.label} className="absolute top-0 -translate-x-1/2 text-center pointer-events-none" style={{ left: `${m.at * 100}%` }} aria-hidden="true">
              <div className="mx-auto w-px h-6 bg-black/25" />
              <p className="font-sans text-[11px] font-bold pt-1 whitespace-nowrap">{m.label}</p>
              <p className="font-sans text-[11px] whitespace-nowrap hidden md:block">{m.note}</p>
            </div>
          ))}
          {/* a stop for every moment */}
          {STOPS.map((p, n) => (
            <span key={n} aria-hidden="true" className={`absolute top-6 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-colors duration-300 ${n <= i ? 'bg-cobalt/60' : 'bg-black/25'}`} style={{ left: `${p * 100}%` }} />
          ))}
          {/* the dot */}
          <div role="slider" tabIndex={0} aria-label="Moment of the evening" aria-valuemin={1} aria-valuemax={SHADOW_BEATS.length} aria-valuenow={i + 1} aria-valuetext={beat.title}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); go(i + 1); }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); go(i - 1); }
              if (e.key === 'Home') { e.preventDefault(); go(0); }
              if (e.key === 'End') { e.preventDefault(); go(last); }
            }}
            className="absolute top-6 w-9 h-9 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center outline-none group"
            style={{ left: `${thumb * 100}%`, cursor: dragX !== null ? 'grabbing' : 'grab', transition: dragX !== null ? 'none' : 'left 700ms cubic-bezier(0.65,0,0.35,1)' }}>
            <span className={`block w-4 h-4 rounded-full bg-cobalt ring-4 ring-cobalt/20 transition-transform duration-200 group-hover:scale-110 group-focus-visible:ring-cobalt/50 ${dragX !== null ? 'scale-125' : ''}`} />
          </div>
        </div>

        {/* only what changes cross-fades (the number, the title and the text); the "/ 08" and the layout stay put */}
        <div className="min-h-[13rem] md:min-h-[12rem]" aria-live="polite">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-5">
            <p className="font-display text-5xl md:text-7xl tracking-tight leading-none tabular-nums flex">
              <span className="grid text-cobalt">
                {SHADOW_BEATS.map((b, n) => <span key={b.id} className="col-start-1 row-start-1" style={show(n)} aria-hidden={n !== i}>{String(n + 1).padStart(2, '0')}</span>)}
              </span>
              <span className="opacity-25 whitespace-pre"> / {String(SHADOW_BEATS.length).padStart(2, '0')}</span>
            </p>
            <h4 className="font-display font-normal text-lg tracking-wide leading-none text-ink md:pb-1 grid">
              {SHADOW_BEATS.map((b, n) => <span key={b.id} className="col-start-1 row-start-1" style={show(n)} aria-hidden={n !== i}>{b.title}</span>)}
            </h4>
          </div>
          <div className="grid">
            {SHADOW_BEATS.map((b, n) => <p key={b.id} className="col-start-1 row-start-1 font-sans text-lg leading-relaxed" style={show(n)} aria-hidden={n !== i}>{b.text}</p>)}
          </div>
        </div>
      </div>
    </Chapter>
  );
};
