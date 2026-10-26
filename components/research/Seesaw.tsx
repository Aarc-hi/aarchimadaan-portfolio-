import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { SCALE_ITEMS } from './thelaData';
import { Chapter, labelCls, tile, useEvidence, useJump } from './shared';

type Item = (typeof SCALE_ITEMS)[number];

export const Seesaw: React.FC = () => {
  const { active } = useEvidence();
  const [placed, setPlaced] = useState<string[]>([]);   // the cards on the scale, in the order they were put there
  const [last, setLast] = useState<string | null>(null); // the card whose note is showing
  const [width, setWidth] = useState(520);
  const box = useRef<HTMLDivElement>(null);
  // the evidence links in the insights jump here with the whole scale loaded and the regulation note open
  useJump('regulation', () => { setPlaced(SCALE_ITEMS.map((i) => i.id)); setLast('regulation'); });

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el); setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const on = (side: 'L' | 'R') => SCALE_ITEMS.filter((i) => i.side === side && placed.includes(i.id));
  const wL = on('L').reduce((a, i) => a + i.weight, 0);
  const wR = on('R').reduce((a, i) => a + i.weight, 0);
  const diff = wL - wR;
  const angle = Math.max(-14, Math.min(14, (wR - wL) * 3.2));
  const drop = Math.sin((angle * Math.PI) / 180) * (width * 0.42);

  const toggle = (id: string) => {
    if (placed.includes(id)) { setPlaced((p) => p.filter((x) => x !== id)); setLast((l) => (l === id ? null : l)); }
    else { setPlaced((p) => [...p, id]); setLast(id); }
  };
  const reset = () => { setPlaced([]); setLast(null); };

  const verdict = placed.length === 0 ? ''
    : diff > 1.6 ? 'The daily challenges outweigh the support.'
    : diff >= 0.4 ? 'Daily challenges weigh a little more, but community support keeps the scale close to level.'
    : diff > -0.4 ? 'Level: support and challenges balance out.'
    : 'Community support outweighs the challenges.';
  const open = SCALE_ITEMS.find((i) => i.id === last) || null;

  const chip = (it: Item, where: 'tray' | 'pan') => {
    const challenge = it.side === 'L';
    return (
      <button key={it.id} type="button" onClick={() => toggle(it.id)} aria-pressed={placed.includes(it.id)}
        className={`px-3 md:px-4 py-2 rounded-full font-sans text-[11px] transition-all duration-300 hover:scale-105 ${challenge ? 'bg-ink text-paper' : 'bg-cobalt text-white'} ${it.evidence && active === 3 ? 'ring-4 ring-cobalt/40 scale-105' : ''} ${last === it.id && where === 'pan' ? 'ring-2 ring-offset-2 ring-offset-paper ' + (challenge ? 'ring-ink/50' : 'ring-cobalt/50') : ''}`}
        style={where === 'pan' ? { animation: 'scaleDrop 380ms cubic-bezier(.34,1.56,.64,1) both' } : undefined}>
        {it.label}
      </button>
    );
  };

  const pan = (side: 'L' | 'R', label: string) => (
    <div style={{ transform: `translateY(${side === 'L' ? -drop : drop}px)`, transition: 'transform .7s cubic-bezier(.34,1.3,.5,1)' }}>
      <div className="mx-auto w-px h-8 bg-black/30" />
      <div className={`rounded-b-[2.5rem] rounded-t-md border-2 border-t-4 px-3 py-4 min-h-[9rem] md:min-h-[10rem] flex flex-col items-center justify-start gap-2 ${side === 'L' ? 'border-ink/60' : 'border-cobalt'}`}>
        <p className={`${labelCls} pb-1`}>{label.toUpperCase()}</p>
        {on(side).map((i) => chip(i, 'pan'))}
      </div>
    </div>
  );

  const tray = SCALE_ITEMS.filter((i) => !placed.includes(i.id));

  return (
    <Chapter id="ch-balance" n="08" kicker="What the vendors carry" title="Challenges against community support"
      intro="Every vendor carries daily pressures, and every vendor leans on the people around them. Tap a card to put it on the scale, read what we saw in the market, and watch which way it tips.">
      <div className={`${tile} p-5 md:p-10`}>
        <div ref={box} className="relative max-w-2xl mx-auto">
          {/* beam */}
          <div className="relative h-10">
            <div className="absolute left-[8%] right-[8%] top-3 h-1.5 rounded-full bg-ink origin-center" style={{ transform: `rotate(${angle}deg)`, transition: 'transform .7s cubic-bezier(.34,1.3,.5,1)' }} />
            <div className="absolute left-1/2 top-4 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[26px] border-l-transparent border-r-transparent border-b-black/25" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-8 -mt-1">
            {pan('L', 'Daily challenges')}
            {pan('R', 'Community support')}
          </div>
        </div>

        {/* the cards that are still to be put on the scale */}
        <div className="max-w-2xl mx-auto mt-10 min-h-[5.5rem]">
          <p className={`${labelCls} text-center pb-3`}>{tray.length ? 'TAP A CARD TO PUT IT ON THE SCALE' : 'EVERYTHING IS ON THE SCALE'}</p>
          <div className="flex flex-wrap justify-center gap-2">{tray.map((i) => chip(i, 'tray'))}</div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 pt-8 mt-8 border-t border-black/10 min-h-[8rem]" aria-live="polite">
          <div className="max-w-lg">
            {open ? (
              <>
                <p className="font-sans text-lg leading-relaxed"><span className="font-bold">{open.label}.</span> {open.note}</p>
                {verdict && <p className="font-sans text-[11px] pt-3 tracking-wide">{verdict}</p>}
              </>
            ) : (
              <p className="font-sans text-lg leading-relaxed">{verdict || 'Nothing on the scale yet. Start with any card.'}</p>
            )}
          </div>
          <button type="button" onClick={reset} disabled={placed.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/15 font-sans text-[11px] hover:border-cobalt hover:text-cobalt transition-colors disabled:opacity-30 disabled:hover:border-black/15 disabled:hover:text-inherit"><RotateCcw size={14} /> Reset</button>
        </div>
      </div>
      <style>{`@keyframes scaleDrop { from { opacity: 0; transform: translateY(-14px) scale(.8) } to { opacity: 1; transform: none } }
      @media (prefers-reduced-motion: reduce) { [style*="scaleDrop"] { animation: none !important } }`}</style>
    </Chapter>
  );
};
