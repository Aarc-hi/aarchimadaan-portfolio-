import React, { useState } from 'react';
import { ICONS, IMG, PANELS } from './pawlyData';
import { Block, boxStyle, labelCls, pill } from './shared';
import { Marked } from '../Marked';

const PACKET_3D = '/PAWLY/packet-3d/index.html';

// The 3D model drags and zooms, which would swallow page scrolling, so it only goes live after a click.
const Packet3D: React.FC = () => {
  const [live, setLive] = useState(false);
  return (
    <div className="relative w-full h-[70vh] min-h-[420px] max-h-[720px] rounded-2xl overflow-hidden border-2 border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" onMouseLeave={() => setLive(false)}>
      <iframe src={PACKET_3D} title="Pawly packet in 3D" className="w-full h-full block" loading="lazy" />
      {!live ? (
        <button type="button" onClick={() => setLive(true)} aria-label="Interact with the 3D packet"
          className="absolute inset-0 w-full h-full cursor-pointer flex items-end justify-center pb-24 bg-transparent">
          <span className="font-sans text-[11px] tracking-wide bg-paper/90 border border-black/15 rounded-full px-4 py-2">Click to explore · drag to turn</span>
        </button>
      ) : (
        <button type="button" onClick={() => setLive(false)}
          className="absolute top-4 right-4 font-sans text-[11px] tracking-wide bg-paper/90 border border-black/15 rounded-full px-4 py-2 cursor-pointer hover:text-cobalt">Done</button>
      )}
    </div>
  );
};

// Where the dieline folds, in % of the artwork (the same measurements as the panels below): down the body between the four panels
// and the glue flap, and along the top and the bottom of the body.
const FOLDS = { x: [8.2, 38.4, 53.6, 83.6], left: 8.2, right: 98.7, top: 14.9, bottom: 84.3 };
// ── 05 Dieline ───────────────────────────────────────────────────
export const Dieline: React.FC = () => {
  const [active, setActive] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const [visuals, setVisuals] = useState(true); // false = just the die-cut silhouette
  return (
    <Block id="dieline" n="05" kicker="Structure" title="Dieline">
      {/* the toggle and the sizes button sit on the left, the dieline on the right */}
      <div className="grid md:grid-cols-[13rem_minmax(0,1fr)] gap-6 md:gap-10 items-start">
      <div className="flex flex-col items-start gap-5 md:mt-[calc(max(416px,_100vh_-_380px)_/_2_-_39px)]"> {/* stays where it was when the image was smaller: halfway down the old image height, so growing the image does not move the buttons */}
        {/* Dieline  [switch]  Visuals: the same toggle as the one on the market map. Dieline shows only the die-cut silhouette, Visuals the artwork */}
        <div className="flex items-center gap-3 font-sans text-[11px]">
          <button type="button" onClick={() => setVisuals(false)} className={`transition-colors cursor-pointer ${!visuals ? 'text-cobalt' : 'opacity-60 hover:opacity-100'}`}>Dieline</button>
          <button type="button" role="switch" aria-checked={visuals} aria-label="Show the artwork" onClick={() => setVisuals((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${visuals ? 'bg-cobalt' : 'bg-black/20'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${visuals ? 'translate-x-5' : ''}`} />
          </button>
          <button type="button" onClick={() => setVisuals(true)} className={`transition-colors cursor-pointer ${visuals ? 'text-cobalt' : 'opacity-60 hover:opacity-100'}`}>Visuals</button>
        </div>
        <button type="button" onClick={() => setAll((v) => !v)} className={pill(all)}>{all ? 'Hide all sizes' : 'Show all sizes'}</button>
      </div>
      <div className="overflow-x-auto no-scrollbar rounded-2xl" style={{ width: 'min(100%, max(560px, calc((100vh - 380px) * 1.4926)))' }}> {/* sized by height, so the heading, toggle and the whole dieline fit on one screen */}
        <div className="relative min-w-[560px]" onMouseLeave={() => setActive(null)}>
          {/* both pictures are stacked and cross-fade, so the switch is one smooth dissolve; the panels sit on top of both */}
          <img src={IMG.dieline} alt="Pawly dieline, flat" className="w-full block rounded-2xl" style={{ opacity: visuals ? 1 : 0, transition: 'opacity 600ms ease-in-out' }} />
          <img src={IMG.dielineSilhouette} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full block" style={{ opacity: visuals ? 0 : 1, transition: 'opacity 600ms ease-in-out' }} />
          {/* the fold lines, dashed, in % of the artwork: the panel edges down the body, and the top and bottom of the body. Only shown on the Dieline view */}
          <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: visuals ? 0 : 1, transition: 'opacity 600ms ease-in-out' }}>
            {FOLDS.x.map((x) => <line key={`fx${x}`} x1={x} x2={x} y1={FOLDS.top} y2={FOLDS.bottom} stroke="#494441" strokeWidth={1.2} strokeDasharray="7 5" vectorEffect="non-scaling-stroke" opacity={0.7} />)}
            {[FOLDS.top, FOLDS.bottom].map((y) => <line key={`fy${y}`} x1={FOLDS.left} x2={FOLDS.right} y1={y} y2={y} stroke="#494441" strokeWidth={1.2} strokeDasharray="7 5" vectorEffect="non-scaling-stroke" opacity={0.7} />)}
          </svg>
          {PANELS.map((p) => {
            const on = active === p.id;
            return (
              <button key={p.id} type="button" aria-label={`${p.name}, ${p.size}`} onMouseEnter={() => setActive(p.id)} onFocus={() => setActive(p.id)} onBlur={() => setActive(null)} onClick={() => setActive(p.id)}
                className={`absolute rounded-sm cursor-pointer transition-colors duration-200 flex items-center justify-center ${on ? 'bg-cobalt/10 border-2 border-dashed border-cobalt z-10' : 'border-2 border-transparent'}`} style={boxStyle(p.box)}>
                {(on || all) && (
                  <span className="bg-paper/95 rounded-md px-2 py-1 shadow-[0_4px_12px_rgba(0,0,0,0.15)] font-sans text-[11px] leading-tight text-center text-ink">
                    <span className="block font-bold">{p.name}</span><span className="block tabular-nums whitespace-nowrap">{p.size}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </Block>
  );
};

// ── 07 Benefit icons ─────────────────────────────────────────────
export const BenefitIcons: React.FC = () => (
  <Block id="icons" n="07" kicker="Iconography" title="Benefit icons">
    {/* one cream strip with the four icons in a row, small and still */}
    <div className="rounded-2xl px-6 md:px-10 py-6 md:py-7 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 justify-items-center" style={{ background: '#EBE7DD' }}>
      {ICONS.map((i) => (
        <div key={i.id} className="flex flex-col items-center gap-3 text-center">
          <img src={i.src} alt="" className="w-14 md:w-16" />
          <span className="font-bold uppercase text-[11px] leading-tight" style={{ color: '#F7923C', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>{i.label}</span>
        </div>
      ))}
    </div>
  </Block>
);

// ── 08 The brief and the question (the same two outlined boxes as "What is Pawly?") ──
const BRIEF = [
  { id: 'brief', label: 'The brief', text: 'Create a **window packaging** product, with a **hero visual** and graphic-heavy packaging.' },
  { id: 'hmw', label: 'How might we', text: 'How might we design cat food packaging that **stands out visually on shelves** while also improving usability and maintaining product freshness for everyday use?' },
];

export const Decisions: React.FC = () => (
  <Block id="decisions" n="08" kicker="Thinking" title="The brief">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {BRIEF.map((b) => (
        <div key={b.id} className="border-2 border-cobalt/35 text-ink p-6 md:p-8 flex flex-col gap-4">
          <p className={labelCls}>{b.label}</p>
          <p className="font-sans text-lg leading-relaxed"><Marked text={b.text} /></p>
        </div>
      ))}
    </div>
  </Block>
);

// ── 09 Fold it: the last thing on the page ───────────────────────
export const FoldIt: React.FC = () => (
  <Block id="fold" n="09" kicker="Prototype" title="Fold it">
    <Packet3D />
  </Block>
);
