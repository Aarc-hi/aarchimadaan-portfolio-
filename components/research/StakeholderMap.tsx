import React, { useState } from 'react';
import { INVISIBLE_DOT_NAMES, QUADRANT_NOTES, STAKEHOLDERS, Quadrant } from './thelaData';
import { Chapter, labelCls, useEvidence, useInViewOnce } from './shared';

// The map plots itself the first time it scrolls into view (and only that once): the grid and axes draw, then the stakeholders appear one by one.
const PLOT_CSS = `
@keyframes plotFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes plotAxisY { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@keyframes plotAxisX { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes plotDot { from { opacity: 0; transform: scale(0) } to { opacity: 1; transform: scale(1) } }
@keyframes plotLabel { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: translateY(0) } }
@media (prefers-reduced-motion: reduce) { [data-plot] { animation: none !important; opacity: 1 !important; } }
`;
const PLOT_FIRST_DOT_MS = 900; // the grid and axes take about this long to draw before the first stakeholder lands
const PLOT_STEP_MS = 85;     // then one stakeholder every this many ms

const QUADRANT_LABELS: { q: Quadrant; cls: string }[] = [
  { q: 'Keep satisfied', cls: 'left-[3%] top-[3%]' },
  { q: 'Manage closely', cls: 'right-[3%] top-[3%]' },
  { q: 'Monitor', cls: 'left-[3%] bottom-[3%]' },
  { q: 'Keep informed', cls: 'right-[3%] bottom-[3%]' },
];

export const StakeholderMap: React.FC = () => {
  const { personaFocus } = useEvidence();
  const [hover, setHover] = useState<string | null>(null);

  const hovered = STAKEHOLDERS.find((s) => s.name === hover);
  const { ref: mapRef, seen } = useInViewOnce<HTMLDivElement>(0.35);
  // before the map has been seen everything on it is hidden; once seen, each part runs its entrance exactly once
  const plot = (name: string, ms: number, delay = 0): React.CSSProperties => (
    seen ? { animation: `${name} ${ms}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both` } : { opacity: 0 }
  );

  return (
    <Chapter id="ch-stakeholders" n="04" kicker="Stakeholder mapping" title="Stakeholder"
      intro="Every stakeholder placed by how much power they hold and how interested they are. Hover one to read its box.">
      <div>
        {/* No card and no width limit: the map takes the whole width of the page (less the room the POWER label needs on the left). */}
        <div>
        <div ref={mapRef} className="relative aspect-[5/4] md:aspect-[16/10] ml-6 md:ml-8 mb-8">
          <style>{PLOT_CSS}</style>
          {/* quadrants */}
          <div data-plot="" style={plot('plotFade', 600)} className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-black/10 rounded-xl overflow-hidden">
            <div className="bg-paper" /><div className="bg-cobalt/5" /><div className="bg-paper" /><div className="bg-paper" />
          </div>
          {QUADRANT_LABELS.map(({ q, cls }) => (
            <span key={q} data-plot="" style={plot('plotFade', 500, 350)} className={`absolute ${cls} ${labelCls} ${hovered?.q === q ? '!opacity-100 text-cobalt' : ''} transition-all`}>{q}</span>
          ))}
          {/* axes */}
          {/* the two axes: a line along the left edge (power, rising upwards) and one along the bottom (interest, rising to the right) */}
          <span aria-hidden="true" data-plot="" style={{ ...plot('plotAxisY', 800), transformOrigin: 'bottom' }} className="absolute left-0 top-0 bottom-0 w-px bg-ink/50 pointer-events-none" />
          <span aria-hidden="true" data-plot="" style={{ ...plot('plotAxisX', 800), transformOrigin: 'left' }} className="absolute left-0 right-0 bottom-0 h-px bg-ink/50 pointer-events-none" />
          <svg aria-hidden="true" data-plot="" style={plot('plotFade', 400, 650)} viewBox="0 0 10 10" className="absolute -left-[4.5px] -top-1.5 w-2.5 h-2.5 text-ink/60 pointer-events-none"><path d="M0 10 L5 0 L10 10" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
          <svg aria-hidden="true" data-plot="" style={plot('plotFade', 400, 650)} viewBox="0 0 10 10" className="absolute -right-1.5 -bottom-[4.5px] w-2.5 h-2.5 text-ink/60 pointer-events-none"><path d="M0 0 L10 5 L0 10" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
          <span data-plot="" style={plot('plotFade', 500, 400)} className="font-sans text-[11px] tracking-wide text-ink/80 absolute -left-6 md:-left-8 top-1/2 -rotate-90 origin-center -translate-y-1/2 whitespace-nowrap">POWER</span>
          <span data-plot="" style={plot('plotFade', 500, 400)} className="font-sans text-[11px] tracking-wide text-ink/80 absolute left-1/2 -bottom-6 -translate-x-1/2">INTEREST</span>

          {/* Hovering a stakeholder draws a line from its dot across to the POWER axis (left) and down to the INTEREST axis (bottom) */}
          {STAKEHOLDERS.map((s, i) => {
            const on = hover === s.name || personaFocus === s.name;
            return (
              <React.Fragment key={'guide' + s.name + i}>
                {/* the dot's centre sits 5px above the point (its label is above it), so the lines start there */}
                <span aria-hidden="true" style={{ left: 0, top: `calc(${s.y}% - 5px)`, width: `${s.x}%` }}
                  className={`absolute h-px bg-cobalt/35 origin-right pointer-events-none transition-transform duration-300 ease-out ${on ? 'scale-x-100' : 'scale-x-0'}`} />
                <span aria-hidden="true" style={{ left: `${s.x}%`, top: `calc(${s.y}% - 5px)`, height: `calc(${100 - s.y}% + 5px)` }}
                  className={`absolute w-px bg-cobalt/35 origin-top pointer-events-none transition-transform duration-300 ease-out ${on ? 'scale-y-100' : 'scale-y-0'}`} />
                <span aria-hidden="true" style={{ left: 0, top: `calc(${s.y}% - 5px)` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cobalt/60 pointer-events-none transition-opacity duration-300 ${on ? 'opacity-100' : 'opacity-0'}`} />
                <span aria-hidden="true" style={{ left: `${s.x}%`, top: '100%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cobalt/60 pointer-events-none transition-opacity duration-300 ${on ? 'opacity-100' : 'opacity-0'}`} />
              </React.Fragment>
            );
          })}

          {STAKEHOLDERS.map((s, i) => {
            const on = hover === s.name || personaFocus === s.name;
            return (
              // No box: a small label sitting over a blue dot. The dot is the point on the map (bottom centre of the button).
              // Solid dots are the visible stakeholders, hollow dots the invisible ones (see the legend under the map).
              <button key={s.name + i} type="button"
                onMouseEnter={() => setHover(s.name)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(s.name)} onBlur={() => setHover(null)}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-full w-[7.5rem] flex flex-col items-center gap-1 cursor-pointer transition-all duration-200 ${on ? 'z-10' : ''}`}>
                <span data-plot="" style={plot('plotLabel', 450, PLOT_FIRST_DOT_MS + i * PLOT_STEP_MS)} className={`font-sans text-[9px] md:text-[10px] leading-tight text-center transition-colors duration-200 ${on ? 'text-cobalt' : 'text-ink/70'}`}>{s.name}</span>
                <span data-plot="" style={plot('plotDot', 500, PLOT_FIRST_DOT_MS + i * PLOT_STEP_MS)} className={`block rounded-full transition-all duration-200 ${INVISIBLE_DOT_NAMES.has(s.name) ? `border-[1.5px] border-cobalt ${on ? 'bg-cobalt' : 'bg-paper'}` : 'bg-cobalt'} ${on ? 'w-3 h-3' : 'w-2 h-2'} ${personaFocus === s.name ? 'ring-4 ring-cobalt/25' : ''}`} />
              </button>
            );
          })}
        </div>

        <p className="font-sans text-lg min-h-[3.5rem] ml-6 md:ml-8">
          {hovered
            ? <><span className="font-bold text-cobalt">{hovered.name}</span> sits in <span className="font-bold">{hovered.q}</span>. {QUADRANT_NOTES[hovered.q]}</>
            : <span>Hover a stakeholder to see which box it’s in.</span>}
        </p>
        {/* legend: the two kinds of dot */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-sans text-[11px] ml-6 md:ml-8 mt-2">
          <span className="flex items-center gap-2"><span aria-hidden="true" className="block w-2 h-2 rounded-full bg-cobalt" />Visible stakeholders</span>
          <span className="flex items-center gap-2"><span aria-hidden="true" className="block w-2 h-2 rounded-full border-[1.5px] border-cobalt bg-paper" />Invisible stakeholders</span>
        </div>
        </div>
      </div>

    </Chapter>
  );
};
