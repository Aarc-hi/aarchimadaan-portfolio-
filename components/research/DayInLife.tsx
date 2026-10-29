import React, { useEffect, useRef, useState } from 'react';
import { DAY_KINDS, DAY_STEPS, DayKind } from './thelaData';
import { Chapter, glowClass, labelCls, useEvidence, useJump } from './shared';

const KIND_COLOR: Record<DayKind, string> = {
  home: 'rgba(26,26,26,0.20)',
  sourcing: 'rgba(42,82,190,0.45)',
  rest: 'rgba(26,26,26,0.07)',
  stall: '#2A52BE',
};

const hr = (h: number) => `${h % 12 || 12}${h < 12 || h === 24 ? 'am' : 'pm'}`;
const polar = (cx: number, cy: number, r: number, hour: number) => {
  const a = ((hour - 6) / 18) * 2 * Math.PI - Math.PI / 2;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const [x1, y1] = polar(cx, cy, r, from); const [x2, y2] = polar(cx, cy, r, to - 0.04);
  const large = (to - from) / 18 > 0.5 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
};

const totals = (Object.keys(DAY_KINDS) as DayKind[]).map((k) => ({ k, h: DAY_STEPS.filter((s) => s.kind === k).reduce((a, s) => a + (s.to - s.from), 0) }));

// Between the first and the last hour of her day the page moves a card at a time: every STEP_PX of scrolling brings the next card exactly to
// the middle of the screen (and that card is the one the dial shows), so a quick scroll runs through the day fast and a slow one goes
// hour by hour. The page only carries on to the next chapter once the last hour has been in the middle, and only goes back up to the
// previous one once the first has.
const SNAP_MS = 190;     // how long a step takes: quick, and it lands exactly on the card's centre
const STEP_PX = 70;      // this much scrolling is one step (a mouse-wheel notch is about 100, so a notch is one hour)
const IDLE_MS = 220;     // a pause this long ends a scroll: the next one starts counting from zero

export const DayInLife: React.FC = () => {
  const { active } = useEvidence();
  const [cur, setCur] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const goToRef = useRef<(i: number) => void>(() => {});
  const [padTop, setPadTop] = useState(0);        // the scrolling column's own top padding (a pinned element has to be pulled up by it)
  const [viewH, setViewH] = useState(700);   // the height of the scrolling column, so the dial can be pinned in the middle of the screen
  const dialRef = useRef<HTMLDivElement>(null);
  const [dialH, setDialH] = useState(420);    // the height of the dial block (dial, time, legend)
  useEffect(() => {
    const el = dialRef.current;
    if (!el) return;
    const m = () => setDialH(el.offsetHeight);
    m();
    const ro = new ResizeObserver(m); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // the element that scrolls (the project page's right-hand column)
    let sc: HTMLElement | null = grid.parentElement;
    while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    if (!sc) return;
    const scroller = sc;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure = () => { setViewH(scroller.clientHeight); setPadTop(parseFloat(getComputedStyle(scroller).paddingTop) || 0); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(scroller);

    // the scrollTop at which card i sits exactly in the middle of the scroller
    const target = (i: number) => {
      const el = refs.current[i]; if (!el) return 0;
      const r = el.getBoundingClientRect(), s = scroller.getBoundingClientRect();
      return scroller.scrollTop + (r.top + r.height / 2) - (s.top + s.height / 2);
    };
    const targets = () => DAY_STEPS.map((_, i) => target(i));
    const nearest = () => { const t = targets(), y = scroller.scrollTop; let b = 0; t.forEach((v, i) => { if (Math.abs(v - y) < Math.abs(t[b] - y)) b = i; }); return b; };
    // our own short ease-out (the browser's smooth scroll is slow and drifts); it lands exactly on the card's centre
    let anim = 0;
    let pend: number | null = null;   // the card the page is heading to right now (null = at rest)
    const animateTo = (to: number, heading: number, ms: number) => {
      cancelAnimationFrame(anim);
      pend = heading;
      const from = scroller.scrollTop, t0 = performance.now();
      if (reduce || Math.abs(to - from) < 2) { scroller.scrollTop = to; pend = null; return; }
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        scroller.scrollTop = from + (to - from) * (1 - Math.pow(1 - p, 3));
        if (p < 1) anim = requestAnimationFrame(tick); else { scroller.scrollTop = to; pend = null; }
      };
      anim = requestAnimationFrame(tick);
    };
    const goTo = (i: number) => animateTo(target(i), i, SNAP_MS);
    goToRef.current = goTo;
    // the way out at the bottom: straight to the start of the next chapter, in one move, so the dial's column never gets caught half
    // way out of the screen
    const leaveDown = () => {
      const nextEl = grid.closest('#ch-day')?.nextElementSibling as HTMLElement | null;
      if (!nextEl) return false;
      const top = scroller.scrollTop + nextEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 24;
      animateTo(top, DAY_STEPS.length, 320);   // heading "past the last card": further scrolling is held until it lands
      return true;
    };

    // the card nearest the middle is the one that is lit and shown on the dial
    let raf = 0;
    const onScroll = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; setCur(nearest()); }); };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // a card per STEP_PX of scrolling while inside the day
    let acc = 0, accDir = 0, lastWheel = 0, lastHandled = 0;
    const next = (dir: 1 | -1): number | null => {
      const t = targets(), y = scroller.scrollTop, H = scroller.clientHeight * 0.55, tol = 4;
      if (y < t[0] - H || y > t[t.length - 1] + H) return null;            // nowhere near the day: scroll normally
      if (dir === 1) { const i = t.findIndex((v) => v > y + tol); return i < 0 ? null : i; }   // null = past the last hour: carry on
      for (let i = t.length - 1; i >= 0; i--) if (t[i] < y - tol) return i;
      return null;                                                          // above the first hour: carry on
    };
    const step = (dir: 1 | -1, e: Event, amount: number, fresh: boolean) => {
      const now = performance.now();
      // the card to head for: the one after the one we are already heading to, or (at rest) the next one past where the page is
      const dest = pend == null ? next(dir) : (pend + dir >= 0 && pend + dir < DAY_STEPS.length ? pend + dir : -1);
      if (dest == null) {
        // at rest and past either end of the day. The rest of the scroll that just got us here is held; a new scroll down from the last
        // card leaves the day for the next chapter in one move, and a new scroll up from the first card just carries on up
        if (!fresh && now - lastHandled < 600) { e.preventDefault(); return; }
        if (dir === 1 && fresh) {
          const t = targets(), y = scroller.scrollTop;
          if (y >= t[t.length - 1] - 4 && y <= t[t.length - 1] + scroller.clientHeight * 0.55 + 200 && leaveDown()) { e.preventDefault(); lastHandled = now; }
        }
        return;
      }
      e.preventDefault();
      lastHandled = now;
      if (dest < 0) return;                                  // still moving towards the last (or first) card: wait for it
      if (fresh || dir !== accDir) acc = 0;
      accDir = dir; acc += amount;
      if (acc < STEP_PX) return;
      acc -= STEP_PX;
      goTo(dest);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = performance.now(); const fresh = now - lastWheel > IDLE_MS; lastWheel = now;
      step(e.deltaY > 0 ? 1 : -1, e, Math.abs(e.deltaY), fresh);
    };
    const onKey = (e: KeyboardEvent) => {
      if (/^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName || '')) return;
      const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey);
      const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey);
      if (down || up) step(down ? 1 : -1, e, STEP_PX, !e.repeat);
    };
    scroller.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      scroller.removeEventListener('scroll', onScroll); scroller.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey);
      if (raf) cancelAnimationFrame(raf);
      cancelAnimationFrame(anim);
      ro.disconnect();
    };
  }, []);

  useJump('fines', () => { setCur(7); goToRef.current(7); });

  const step = DAY_STEPS[cur];
  const mid = (step.from + step.to) / 2;
  const [hx, hy] = polar(110, 110, 62, mid);
  const [dx, dy] = polar(110, 110, 90, mid);

  return (
    <Chapter id="ch-day" n="05" kicker="A day in the life" title="A day in a life"
      intro="Valiben runs a **roadside toy stall**. Scroll through her day and watch the clock move. **Eight hours** go to home and family, and **eight to the stall**.">
      <div ref={gridRef} className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-10 items-start" style={{ '--day-h': `${viewH}px`, '--day-top': `${-padTop + Math.max(0, (viewH - dialH) / 2)}px`, '--day-pb': `${Math.max(24, dialH / 2 - 40)}px` } as React.CSSProperties}>
        {/* On wide screens the dial stays in the middle of the screen while the hours go by on the right. It starts right under the
            chapter's intro (level with the first hour), and is pinned with its middle at the middle of the screen once you scroll. */}
        <div className="sticky top-0 lg:top-[var(--day-top)] z-10 self-start">
        <div ref={dialRef} className="w-full">
          <svg viewBox="0 0 220 220" className="hidden lg:block w-full mx-auto" style={{ maxWidth: Math.max(130, Math.min(250, viewH - 290)) }} role="img" aria-label="24-hour dial from 6am to midnight">
            <circle cx="110" cy="110" r="90" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="18" />
            {DAY_STEPS.map((s, i) => (
              <path key={i} d={arc(110, 110, 90, s.from, s.to)} fill="none" stroke={KIND_COLOR[s.kind]} strokeLinecap="butt"
                strokeWidth={i === cur ? 24 : 16} style={{ transition: 'stroke-width .3s, opacity .3s', opacity: i === cur ? 1 : 0.55 }} />
            ))}
            {[6, 12, 18, 24].map((h) => { const [x, y] = polar(110, 110, 108, h); return <text key={h} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="font-sans text-[8px] fill-black/40">{hr(h)}</text>; })}
            <line x1="110" y1="110" x2={hx} y2={hy} stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" style={{ transition: 'all .5s cubic-bezier(.65,0,.35,1)' }} />
            <circle cx="110" cy="110" r="4" fill="#1A1A1A" />
            <circle cx={dx} cy={dy} r="3.5" fill="#fff" stroke="#1A1A1A" strokeWidth="1.5" style={{ transition: 'all .5s cubic-bezier(.65,0,.35,1)' }} />
          </svg>

          <div className="lg:pt-4 text-center lg:text-left">
            <p className="font-display text-3xl tracking-tight tabular-nums">{hr(step.from)} – {hr(step.to)}</p>
            <p className={`${labelCls} pt-1`}>{DAY_KINDS[step.kind].label.toUpperCase()}</p>
          </div>

          <div className="pt-5" aria-label="Hours of the day by activity">
            <ul className="hidden lg:grid grid-cols-2 gap-x-3 gap-y-2">
              {totals.map(({ k, h }) => (
                <li key={k} className="flex items-center gap-2 font-sans text-[11px]">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: KIND_COLOR[k] }} />
                  <span>{DAY_KINDS[k].label}</span><span className="ml-auto font-bold tabular-nums">{h}h</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>

        <ol className="flex flex-col gap-4 lg:gap-10 lg:pb-[var(--day-pb)]">
          {DAY_STEPS.map((s, i) => (
            <li key={i}>
              <button type="button" data-i={i} ref={(el) => { refs.current[i] = el; }} onClick={() => goToRef.current(i)}
                className={`w-full text-left rounded-2xl p-5 md:p-7 transition-all duration-200 ${i === cur ? 'bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] opacity-100' : 'opacity-45 hover:opacity-80'} ${s.evidence && active === 3 ? glowClass : ''}`}>
                <p className="font-display text-lg tracking-tight pb-2 tabular-nums">{hr(s.from)} – {hr(s.to)}</p>
                <p className="font-sans text-lg leading-relaxed max-w-xl">{s.text}</p>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Chapter>
  );
};
