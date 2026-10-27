import React, { useEffect, useRef, useState } from 'react';
import { MARKET_STATS } from './thelaData';
import { Chapter, useCountUp, useInViewOnce, useJump } from './shared';

// The satellite photo (1242 x 696). It is turned a few degrees to straighten the market, then cropped to the same
// 4:3 box as the sketch. The sketch below is drawn from the same photo, so the two line up when you switch between them:
// the shop rows, the courtyard and the east strip sit where they sit in the photo.
const SATELLITE = {
  src: '/images/market-satellite.webp',
  w: 1242, h: 696,
  crop: { x: 391, y: 114, w: 478 },   // the part of the photo shown (height follows from the 4:3 box)
  rotate: -2.7,                        // degrees, to undo the tilt of the photo
};
const SAT_H = SATELLITE.crop.w * 0.75;

type Focus ='opened' | 'shops' | 'area' | 'rent' | 'renovations' | 'stalls' | 'courtyard';

const Stat: React.FC<{ s: typeof MARKET_STATS[number]; start: boolean }> = ({ s, start }) => {
  const n = useCountUp(typeof s.value === 'number' ? s.value : 0, start);
  const shown = typeof s.value === 'number' ? (s.id === 'area' ? n.toLocaleString('en-IN') : String(n)) : s.value;
  return (
    <span className="font-display text-3xl tracking-tight leading-none tabular-nums">
      {shown}
      {'unit' in s && s.unit ? <span className="text-lg ml-1">{s.unit}</span> : null}
    </span>
  );
};

// The sketch, or (overlay) just its highlights drawn over the satellite photo. In both, nothing is lit until a fact is hovered:
// in the sketch the unlit parts stay as plain outlines, over the photo they are not drawn at all.
// Hovering a part of the plan (the shops, the courtyard, the stalls) lights that part up: onHover reports which.
const Plan: React.FC<{ focus: Focus | null; overlay?: boolean; onHover: (f: Focus | null) => void }> = ({ focus, overlay = false, onHover }) => {
  const shopsOn = focus === 'shops';
  const OFF = 'fill-transparent stroke-transparent';
  // Over the photo only the shapes themselves take the mouse (the overlay as a whole lets it through to the photo)
  const over = (f: Focus) => ({ onMouseEnter: () => onHover(f), onMouseLeave: () => onHover(null), style: overlay ? { pointerEvents: 'all' as const } : undefined });
  const cell = (key: string, x: number, y: number, w: number, h: number) => (
    <rect key={key} x={x + 0.8} y={y + 0.8} width={w - 1.6} height={h - 1.6} rx="1.5" {...over('shops')}
      className={`transition-all duration-300 ${shopsOn ? (overlay ? 'fill-cobalt/30 stroke-cobalt' : 'fill-cobalt/25 stroke-cobalt/60') : overlay ? OFF : 'fill-black/5 stroke-black/25'}`} strokeWidth="0.8" />
  );
  const halo = overlay ? { paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3, strokeLinejoin: 'round' as const } : undefined; // keeps labels readable on the photo
  // Measured from the satellite photo (in the sketch's 400 x 300 box): the north and south shop rows are each as wide as
  // their roofs, the east strip is as wide as its roof, the courtyard sits between them and is open to the main road on the west.
  const north = Array.from({ length: 19 }, (_, i) => cell('n' + i, 30 + i * (279 / 19), 38, 279 / 19, 44));
  const south = Array.from({ length: 19 }, (_, i) => cell('s' + i, 30 + i * (282 / 19), 214, 282 / 19, 53));
  const east = Array.from({ length: 11 }, (_, i) => cell('e' + i, 312, 82 + i * (132 / 11), 43, 132 / 11));
  const stalls = [[12, 110], [21, 122], [12, 134], [21, 146], [12, 158], [21, 170], [12, 182], [21, 194]]; // on the little sidewalk just west of the market, beside the empty lane
  return (
    <svg viewBox="0 0 400 300" className={overlay ? 'absolute inset-0 w-full h-full pointer-events-none' : 'w-full h-auto'} data-plan
      role={overlay ? undefined : 'img'} aria-label={overlay ? undefined : 'Schematic plan of Municipal Market'} aria-hidden={overlay || undefined}>
      {north}{south}{east}
      <rect x="30" y="38" width="325" height="229" rx="4" fill="none"
        className={`transition-all duration-300 ${focus === 'area' ? 'stroke-cobalt' : overlay ? 'stroke-transparent' : 'stroke-black/30'}`} strokeWidth={focus === 'area' ? 3 : 1} />
      {/* The parking courtyard is only the lighter inner rectangle of bare ground (the darker lane around it is not
          part of it), measured from the photo: x 60 to 283, y 104 to 193. */}
      <rect x="60" y="104" width="223" height="89" rx="2" strokeDasharray="4 4" strokeWidth="1.2" {...over('courtyard')}
        className={`transition-all duration-300 ${focus === 'courtyard' ? (overlay ? 'fill-cobalt/20 stroke-cobalt' : 'fill-cobalt/10 stroke-cobalt') : overlay ? OFF : 'fill-transparent stroke-black/30'}`} />
      {(!overlay || focus === 'courtyard') && <text x="171" y="152" textAnchor="middle" style={{ ...halo, pointerEvents: 'none' }} className={`font-sans text-[10px] ${focus === 'courtyard' ? 'fill-cobalt' : 'fill-black/40'}`}>Parking courtyard</text>}
      {/* a transparent patch around the stall dots, so they are easy to hover */}
      <rect x="2" y="100" width="28" height="102" className="fill-transparent" {...over('stalls')} />
      {stalls.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" {...over('stalls')} className={`transition-all duration-300 ${focus === 'stalls' ? 'fill-cobalt' : overlay ? 'fill-transparent' : 'fill-black/25'}`} />
      ))}
      {/* the label for the dots on the sidewalk, over them on two lines so it stays clear of the market's outline */}
      {(!overlay || focus === 'stalls') && (
        <text textAnchor="middle" style={{ ...halo, pointerEvents: 'none' }} className={`font-sans text-[8px] ${focus === 'stalls' ? 'fill-cobalt' : 'fill-black/40'}`}>
          <tspan x="14" y="90">Stalls /</tspan><tspan x="14" y="99">vendors</tspan>
        </text>
      )}
      {/* "Shops" appears over the north row while the shops are lit */}
      {focus === 'shops' && <text x="171" y="64" textAnchor="middle" style={{ ...halo, pointerEvents: 'none' }} className="font-sans text-[12px] fill-cobalt">Shops</text>}
      {focus === 'area' && <text x="192" y="30" textAnchor="middle" style={{ ...halo, pointerEvents: 'none' }} className="font-sans text-[10px] fill-cobalt">≈ 7,000 m²</text>}
      {focus === 'renovations' && [0, 7, 14].map((o, i) => (
        <rect key={o} x="20" y="28" width="345" height="249" rx="8" fill="none" strokeDasharray="5 5" strokeWidth="1.4"
          className="stroke-cobalt" style={{ transform: `scale(${1 - o / 400})`, transformOrigin: '192px 152px', opacity: 0.9 - i * 0.25 }} />
      ))}
    </svg>
  );
};

export const MarketGlance: React.FC = () => {
  const [satellite, setSatellite] = useState(false);
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.25);
  // The plan (sketch or satellite) only lights up while the mouse is over a part of the plan itself (the facts on the left do
  // not light it). A jump from the evidence panel has no hover, so it lights the renovation rings on its own for a moment.
  const [mapHover, setMapHover] = useState<Focus | null>(null);
  const [flash, setFlash] = useState<Focus | null>(null);
  const flashTimer = useRef<number | null>(null);
  useEffect(() => () => { if (flashTimer.current) window.clearTimeout(flashTimer.current); }, []);
  useJump('renovations', () => {
    setFlash('renovations');
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2500);
  });
  const lit = mapHover ?? flash;     // which part of the plan is lit up

  return (
    <Chapter id="ch-market" n="01" kicker="Context" title="The market at a glance"
      intro="Municipal Market, known as “MM” or Munshi’s Bazar, has been part of Ahmedabad’s **commercial and social life** for decades. Hover the plan to see its shops, stalls and courtyard.">
      <div ref={ref} className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6 lg:gap-10 items-start">
        <div className="flex flex-col gap-7 lg:self-center">
          {/* The facts are plain, still text (no boxes): nothing opens or moves when the mouse is over them. Each one shows its note. */}
          {MARKET_STATS.map((s) => {
            return (
              <div key={s.id} className="text-left flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-4">
                  <Stat s={s} start={seen} />
                  <span className="font-sans text-[11px] tracking-wide text-right">{s.label}</span>
                </div>
                <p className="font-sans text-[11px] leading-relaxed pt-1">{s.note}</p>
                {s.id === 'rent' && (
                  <div className="pt-3" aria-hidden="true">
                    <div className="relative h-1.5 rounded-full bg-black/10">
                      <div className="absolute inset-y-0 left-0 w-full rounded-full bg-cobalt" />
                      <span className="absolute -top-1 left-0 w-3.5 h-3.5 rounded-full bg-cobalt" />
                      <span className="absolute -top-1 right-0 w-3.5 h-3.5 rounded-full bg-cobalt" />
                    </div>
                    <div className="flex justify-between font-sans text-[11px] pt-2"><span>₹75</span><span>₹750</span></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* no card and no padding around the map, so it gets the whole column (and the column is the wider one) */}
        <div className="lg:sticky lg:top-6 lg:w-[74%] lg:ml-auto">
          {/* The sketch, with the satellite photo fading in over it (straightened and cropped to the sketch's 4:3 box) */}
          <div className="relative rounded-xl overflow-hidden">
            <Plan focus={lit} onHover={setMapHover} />
            <img src={SATELLITE.src} alt="Satellite view of Municipal Market" draggable={false} data-satellite
              className={`absolute max-w-none select-none transition-opacity duration-500 ${satellite ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              style={{
                width: `${(SATELLITE.w / SATELLITE.crop.w) * 100}%`,
                left: `${-(SATELLITE.crop.x / SATELLITE.crop.w) * 100}%`,
                top: `${-(SATELLITE.crop.y / SAT_H) * 100}%`,
                transformOrigin: `${((SATELLITE.crop.x + SATELLITE.crop.w / 2) / SATELLITE.w) * 100}% ${((SATELLITE.crop.y + SAT_H / 2) / SATELLITE.h) * 100}%`,
                transform: `rotate(${SATELLITE.rotate}deg)`,
              }} />
            {/* a light border exactly the size of the satellite photo; only the sketch shows it (it fades out with the photo) */}
            <div aria-hidden="true" className={`absolute inset-0 rounded-xl border border-black/15 pointer-events-none transition-opacity duration-500 ${satellite ? 'opacity-0' : 'opacity-100'}`} />
            {/* the same highlights, drawn over the photo */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${satellite ? 'opacity-100' : 'opacity-0'}`}>
              <Plan focus={lit} onHover={setMapHover} overlay />
            </div>
          </div>
          {/* Sketch  [switch]  Satellite */}
          {/* on wide screens it hangs just below the map without adding to the column's height, so the facts centre on the sketch itself */}
          <div className="flex items-center gap-3 pt-4 font-sans text-[11px] lg:absolute lg:left-0 lg:top-full">
            <button type="button" onClick={() => setSatellite(false)} className={`transition-colors cursor-pointer ${!satellite ? 'text-cobalt' : 'opacity-60 hover:opacity-100'}`}>Sketch</button>
            <button type="button" role="switch" aria-checked={satellite} aria-label="Satellite view" onClick={() => setSatellite((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${satellite ? 'bg-cobalt' : 'bg-black/20'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${satellite ? 'translate-x-5' : ''}`} />
            </button>
            <button type="button" onClick={() => setSatellite(true)} className={`transition-colors cursor-pointer ${satellite ? 'text-cobalt' : 'opacity-60 hover:opacity-100'}`}>Satellite</button>
          </div>
        </div>
      </div>
    </Chapter>
  );
};
