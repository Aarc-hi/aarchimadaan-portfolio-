import React, { useMemo, useState } from 'react';
import { SORT_ISSUES, SORT_VENDORS } from './thelaData';
import { Chapter, glowClass, labelCls, useEvidence, useInViewOnce, useJump } from './shared';

// The two parts build themselves the first time they scroll into view (once, and quickly): the rows rise in one after another and
// the dots pop in. Before that they are hidden. `backwards` fill keeps the hidden look through each delay only, so the hover
// dimming and highlights work normally afterwards.
const rise = (seen: boolean, delay: number): React.CSSProperties =>
  seen ? { animation: `csRise 420ms cubic-bezier(.2,.7,.2,1) ${delay}ms backwards` } : { opacity: 0 };
const pop = (seen: boolean, delay: number): React.CSSProperties =>
  seen ? { animation: `csPop 320ms cubic-bezier(.34,1.56,.64,1) ${delay}ms backwards` } : { opacity: 0 };

const rankFill =(r: number) => ['', 'bg-cobalt text-white', 'bg-cobalt/60 text-white', 'bg-cobalt/35 text-ink', 'bg-cobalt/20 text-ink', 'bg-cobalt/10 text-ink'][r];

export const CardSorting: React.FC = () => {
  const { active } = useEvidence();
  const [hoverIssue, setHoverIssue] = useState<string | null>(null);
  const [pinIssue, setPinIssue] = useState<string | null>(null);
  const [vendor, setVendor] = useState<string | null>(null);
  useJump('washrooms', () => { setVendor(null); setPinIssue('Unsanitary washrooms'); });

  const issues = useMemo(() => SORT_ISSUES.map((name) => {
    const ranks = SORT_VENDORS.map((v) => v.order.indexOf(name) + 1);
    return { name, ranks, avg: ranks.reduce((a, b) => a + b, 0) / ranks.length };
  }).sort((a, b) => a.avg - b.avg), []);

  const focusIssue = hoverIssue ?? pinIssue;
  const table = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <Chapter id="ch-sorting" n="07" kicker="Card sorting" title="Card sorting"
      intro="**Five vendors** put **five problems** in order of importance. Hover a problem to follow it across everyone, or click a vendor to follow their column. **Rank 1** is the most important.">
      <div className="overflow-x-auto" ref={table.ref}>
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[minmax(130px,1.5fr)_repeat(5,minmax(0,1fr))_minmax(86px,1fr)] items-end gap-2 pb-3" style={rise(table.seen, 0)}>
            <span className={labelCls}>PROBLEM</span>
            {SORT_VENDORS.map((x) => (
              <button key={x.name} type="button" onClick={() => setVendor(vendor === x.name ? null : x.name)}
                className={`text-center rounded-lg py-1.5 transition-colors ${vendor === x.name ? 'bg-cobalt text-white' : 'hover:bg-cobalt/10'}`}>
                <span className="block font-display text-lg leading-none">{x.name}</span>
                <span className={`block font-sans text-[11px] pt-1 leading-tight ${vendor === x.name ? 'opacity-90' : 'opacity-50'}`}>{x.who}</span>
              </button>
            ))}
            <span className={`${labelCls} text-right`}>AVERAGE</span>
          </div>

          {issues.map((it, n) => {
            const dim = focusIssue && focusIssue !== it.name;
            const glow = it.name === 'Unsanitary washrooms' && active === 1;
            const at = 80 + n * 70;   // when this row starts building
            return (
              <div key={it.name} onMouseEnter={() => setHoverIssue(it.name)} onMouseLeave={() => setHoverIssue(null)}
                onClick={() => setPinIssue(pinIssue === it.name ? null : it.name)}
                style={rise(table.seen, at)}
                className={`cursor-pointer grid grid-cols-[minmax(130px,1.5fr)_repeat(5,minmax(0,1fr))_minmax(86px,1fr)] items-center gap-2 py-2.5 border-t border-black/10 transition-all duration-300 rounded-lg ${dim ? 'opacity-30' : ''} ${glow ? glowClass : ''}`}>
                <span className={`font-sans text-lg leading-tight pl-1 ${focusIssue === it.name ? 'text-cobalt font-bold' : ''}`}>{it.name}</span>
                {it.ranks.map((r, c) => (
                  <span key={c} style={pop(table.seen, at + 120 + c * 45)} className={`mx-auto w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-display text-lg transition-all duration-300 ${rankFill(r)} ${vendor && vendor !== SORT_VENDORS[c].name ? 'opacity-25' : ''}`}>{r}</span>
                ))}
                <span className="flex items-center gap-2 justify-end pr-1">
                  <span className="font-display text-lg tabular-nums">{it.avg.toFixed(1)}</span>
                </span>
              </div>
            );
          })}
        </div>

      </div>
      <style>{`@keyframes csRise { from { opacity: 0; transform: translateY(14px) } }
      @keyframes csPop { from { opacity: 0; transform: scale(.4) } }
      @media (prefers-reduced-motion: reduce) { [style*="csRise"], [style*="csPop"] { animation: none !important } }`}</style>
    </Chapter>
  );
};
