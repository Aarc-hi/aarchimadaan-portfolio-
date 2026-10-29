import React, { useEffect, useRef, useState } from 'react';
import { Chapter, useInViewOnce, useJump } from './shared';

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
      {!overlay && <text x="171" y="152" textAnchor="middle" style={{ ...halo, pointerEvents: 'none' }} className="font-sans text-[10px] fill-black/40">Parking courtyard</text>}
      {/* the stalls and vendors on the little sidewalk just west of the market, beside the empty lane: one dashed box, like the courtyard's */}
      <rect x="4" y="104" width="24" height="96" rx="2" strokeDasharray="4 4" strokeWidth="1.2" {...over('stalls')}
        className={`transition-all duration-300 ${focus === 'stalls' ? (overlay ? 'fill-cobalt/20 stroke-cobalt' : 'fill-cobalt/10 stroke-cobalt') : overlay ? OFF : 'fill-transparent stroke-black/30'}`} />
      {/* the label for the box on the sidewalk, over it on two lines so it stays clear of the market's outline */}
      {!overlay && (
        <text textAnchor="middle" style={{ ...halo, pointerEvents: 'none' }} className="font-sans text-[8px] fill-black/40">
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
  const { ref } = useInViewOnce<HTMLDivElement>(0.25);
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
      intro="Municipal Market, known as “MM” or Munshi’s Bazar, has been part of Ahmedabad’s **commercial and social life** for decades. It opened in the **1970s**, and its **49 small shops** stand on the north, east and south sides of a central courtyard, across about **7,000 m²**.">
      <div ref={ref} className="flex flex-col gap-10 lg:gap-12">
        {/* no card and no padding around the map, centred below the description */}
        <div className="relative w-full lg:w-[68%] mx-auto">
          {/* The sketch, with the satellite photo fading in over it (straightened and cropped to the sketch's 4:3 box) */}
          <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
            <img src={SATELLITE.src} alt="Satellite view of Municipal Market" draggable={false} data-satellite
              className="absolute max-w-none select-none"
              style={{
                width: `${(SATELLITE.w / SATELLITE.crop.w) * 100}%`,
                left: `${-(SATELLITE.crop.x / SATELLITE.crop.w) * 100}%`,
                top: `${-(SATELLITE.crop.y / SAT_H) * 100}%`,
                transformOrigin: `${((SATELLITE.crop.x + SATELLITE.crop.w / 2) / SATELLITE.w) * 100}% ${((SATELLITE.crop.y + SAT_H / 2) / SATELLITE.h) * 100}%`,
                transform: `rotate(${SATELLITE.rotate}deg)`,
              }} />
            {/* the highlights, drawn over the photo */}
            <div className="absolute inset-0 pointer-events-none">
              <Plan focus={lit} onHover={setMapHover} overlay />
            </div>
          </div>
          {/* the names of the stalls and the parking courtyard sit outside the photo, in its margins, each with an arrow pointing to its place
              (same 400 x 300 box as the plan, drawn past its edges) */}
          <div aria-hidden="true" className="hidden lg:block absolute left-0 top-0 w-full aspect-[4/3] pointer-events-none">
            <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
              {([
                { d: 'M -30 152 L 6 152 M 0 146 L 7 152 L 0 158', w: 1.3 },
                { d: 'M 408 152 L 272 152 M 279 146 L 271 152 L 279 158', w: 1.3 },
                { d: 'M -30 60 L 44 60 M 38 54 L 45 60 L 38 66', w: 1.3 },
                { d: 'M -30 103 L 14 103 M 7 97 L 15 103 L 7 109', w: 0.8 },       // Entry: the way in, at the upper opening of the lane: the arrow points into the market
                { d: 'M 15 208 L -30 208 M -22 202 L -30 208 L -22 214', w: 0.8 },   // Exit: the way out, at the lower opening: the arrow points out of the market
              ] as { d: string; w: number }[]).map(({ d, w }) => (
                <g key={d} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d={d} stroke="#fff" strokeWidth={w + 2.3} />
                  <path d={d} className="stroke-cobalt" strokeWidth={w} />
                </g>
              ))}
              <text textAnchor="end" className="font-sans text-[7.5px] fill-cobalt"><tspan x="-35" y="150">Stalls /</tspan><tspan x="-35" y="160">vendors</tspan></text>
              <text textAnchor="end" className="font-sans text-[7.5px] fill-cobalt"><tspan x="-35" y="63">Shops</tspan></text>
              <text textAnchor="end" className="font-sans text-[7.5px] fill-cobalt"><tspan x="-35" y="106">Entry</tspan></text>
              <text textAnchor="end" className="font-sans text-[7.5px] fill-cobalt"><tspan x="-35" y="211">Exit</tspan></text>
              <text textAnchor="start" className="font-sans text-[7.5px] fill-cobalt"><tspan x="414" y="150">Parking</tspan><tspan x="414" y="160">area</tspan></text>
            </svg>
          </div>
          <p className="font-sans text-[11px] tracking-wide mt-4">Satellite view of the market</p>
          <p className="font-sans text-[11px] tracking-wide text-cobalt mt-1">Hover the plan to see its shops, stalls and courtyard.</p>
        </div>
      </div>
    </Chapter>
  );
};
