import React from 'react';
import { ArrowUp, Pin, X } from 'lucide-react';
import { INSIGHTS } from './thelaData';
import { Chapter, labelCls, useEvidence } from './shared';

export const InsightsSection: React.FC = () => {
  const { pinned, hoverInsight, togglePin, clearPin, jump } = useEvidence();

  return (
    <Chapter id="ch-insights" n="08" kicker="Insights" title="Insights"
      intro="**Three things** the research kept pointing to. Hover an insight and the collected information behind it lights up in the chapters above. Pin it to keep it lit, or press “See it” to jump straight to a piece of it.">
      {pinned !== null && (
        <div className="flex items-center justify-between gap-4 mb-4 px-5 py-3 rounded-xl bg-cobalt text-white font-sans text-lg">
          <span>Showing the collected information for insight {pinned} across the page.</span>
          <button type="button" onClick={clearPin} className="flex items-center gap-1.5 font-bold hover:opacity-80"><X size={14} /> Clear</button>
        </div>
      )}
      <div className="flex flex-col gap-16 md:gap-20">
        {INSIGHTS.map((ins) => {
          return (
            <article key={ins.id} onMouseEnter={() => hoverInsight(ins.id)} onMouseLeave={() => hoverInsight(null)}
              className="grid md:grid-cols-2 gap-8 md:gap-16 items-start pb-12 md:pb-16 border-b border-cobalt/25">
              {/* the insight, on the left */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-end gap-5 md:gap-8">
                    <span className="font-display text-5xl md:text-7xl tracking-tight leading-none text-cobalt">{ins.id}</span>
                    <h4 className="font-display font-normal text-lg tracking-wide leading-none text-ink md:pb-1">{ins.title}</h4>
                  </div>
                  <button type="button" onClick={() => togglePin(ins.id)} aria-pressed={pinned === ins.id} aria-label={`Pin insight ${ins.id}`}
                    className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${pinned === ins.id ? 'bg-cobalt border-cobalt text-white' : 'border-black/15 hover:border-cobalt hover:text-cobalt'}`}><Pin size={16} /></button>
                </div>
                <p className="font-sans text-lg leading-relaxed pt-6">{ins.text}</p>
              </div>
              {/* the collected information behind it, on the right */}
              <div className="md:pt-3">
                <p className={`${labelCls} pb-3`}>COLLECTED INFORMATION</p>
                <ul className="flex flex-col gap-4">
                  {ins.evidence.map((e) => (
                    <li key={e.key} className="flex items-start justify-between gap-4">
                      <p className="font-sans text-lg leading-snug">{e.text}</p>
                      <button type="button" onClick={() => jump(ins.id, e.chapter, e.key)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cobalt/40 text-cobalt font-sans text-[11px] hover:bg-cobalt hover:text-white transition-colors">See it <ArrowUp size={12} /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </Chapter>
  );
};
