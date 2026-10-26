import React, { useEffect, useState } from 'react';
import { THEMES } from './thelaData';
import { Chapter, glowClass, labelCls, tile, useEvidence } from './shared';

// which insight each theme is evidence for
const EVIDENCE: Record<string, number> = { disappointment: 1, satisfaction: 2, declining: 2 };

export const ThemeExplorer: React.FC = () => {
  const { active, jumpKey } = useEvidence();
  const [sel, setSel] = useState('longevity');

  useEffect(() => {
    if (jumpKey && THEMES.some((t) => t.id === jumpKey.key)) setSel(jumpKey.key);
  }, [jumpKey]);

  const rows = THEMES; // all seven, ranked (the Steady / Concerned filter buttons are gone)

  return (
    <Chapter id="ch-interviews" n="02" kicker="Interviews" title="What people told us"
      intro="Seven themes came up in the interviews, ranked here by how often they recurred. Hover one to see who raised it. The ranking is by recurrence, not by an exact count.">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
        <div className="flex flex-col gap-1 lg:pr-12"> {/* the right padding shortens the bars, leaving a gap before the quotes beside them */}
          {/* the themes are plain rows (no card behind them); the open one is shown in blue */}
          {rows.map((t) => {
            const on = t.id === sel;
            const glow = EVIDENCE[t.id] !== undefined && active === EVIDENCE[t.id];
            return (
              <button key={t.id} type="button" onMouseEnter={() => setSel(t.id)} onFocus={() => setSel(t.id)} onClick={() => setSel(t.id)}
                className={`text-left py-2 transition-all duration-300 ${on ? '' : 'opacity-80 hover:opacity-100'} ${glow ? glowClass : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-display text-lg w-6 tabular-nums ${on ? 'text-cobalt' : 'opacity-40'}`}>{t.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-display text-lg tracking-tight leading-tight transition-colors ${on ? 'text-cobalt' : ''}`}>{t.name}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-black/10 overflow-hidden" aria-hidden="true">
                      <div className={`h-full rounded-full transition-all duration-500 ${on ? 'bg-cobalt' : 'bg-black/30'}`} style={{ width: `${((8 - t.rank) / 7) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          <p className={`${labelCls} pt-2`}>Longer bar = came up more often</p>
        </div>

        {/* no card behind the quotes and no Steady / Concerned tag: just the number, the theme and who said what */}
        {/* Only what changes cross-fades: the number, the theme name and the quotes. The line under the name stays where it is.
            Every theme's number, name and quotes sit in the same spot, one on top of the other, so the old one fades out while the
            new one fades in at the same time, and the space is as tall as the tallest one (nothing below it jumps). */}
        <div className="lg:sticky lg:top-6">
          {(() => {
            const show = (id: string): React.CSSProperties => ({ opacity: id === sel ? 1 : 0, transition: 'opacity 450ms ease', pointerEvents: id === sel ? 'auto' : 'none' });
            return (
              <>
                <div className="grid mb-5">
                  {THEMES.map((t) => <span key={t.id} aria-hidden={t.id !== sel} className="col-start-1 row-start-1 font-display text-5xl text-cobalt tabular-nums" style={show(t.id)}>{String(t.rank).padStart(2, '0')}</span>)}
                </div>
                <h4 className="grid font-display font-normal text-lg tracking-wide leading-tight mb-6 text-ink">
                  {THEMES.map((t) => <span key={t.id} aria-hidden={t.id !== sel} className="col-start-1 row-start-1" style={show(t.id)}>{t.name}</span>)}
                </h4>
                <div className="grid">
                  {THEMES.map((t) => (
                    <ul key={t.id} aria-hidden={t.id !== sel} inert={t.id !== sel} className="col-start-1 row-start-1 flex flex-col gap-5 self-start" style={show(t.id)}>
                      {t.voices.map((v) => (
                        <li key={v.who} className="border-l-2 border-cobalt pl-4">
                          <p className="font-sans text-[11px] tracking-wide mb-1">{v.who}</p>
                          <p className="font-sans text-lg leading-relaxed">{v.note}</p>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </Chapter>
  );
};
