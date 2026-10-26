import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';
import { PROJECTS } from '../data';
import { coverOf } from './WorksStrip';

// ── The Works page ─────────────────────────────────────────────────────────────────────────────────────────────────
// A column of small square tiles that scrolls round for ever. Built to behave exactly like the work page of
// seventeenagency.com, whose values are used below:
//  - the tiles are packed edge to edge, right-aligned on a line through the middle of the page;
//  - the tile under the pointer GROWS WIDER, out to the left (2.55x), its two neighbours a little (1.55x), over 1s;
//  - at the left is the full list of tags with the ones the shown project is about picked out in black (the original
//    does this with its types of work), and at the right is that project's name. The shown project is the one under
//    the pointer, or else the one the column has stopped on (the tile nearest the middle of the screen);
//  - wheel / trackpad / touch / arrow keys move the column.
// (The original covers each image with a block of colour until an eye icon is clicked; that eye and the colour were
// removed here, so the images always show.)
// On narrow screens (under 992px) the column moves to the right edge, the name sits at the left and the tile in the
// middle of the screen is the one that is "hovered".
//
// Everything you are likely to want to change is in this block.
const WORKS = {
  tileVh: 16,           // a tile is this many % of the window height WIDE (seventeenagency.com's square tiles are 10)
  aspect: 4 / 3,        // how much taller than wide: 4/3 is portrait (3:4); 1 would be square
  target: 2.55,         // the hovered tile is this many times as wide as a tile (25.5vh / 10vh on the original)
  adjacent: 1.55,       // its neighbours
  targetRem: 12,        // on narrow screens the widths are fixed: hovered tile, in rem...
  adjacentRem: 8,       // ...and neighbours (now worked out from the tile instead, see below)
  growMs: 1000,         // how long a tile takes to grow or shrink (easing 0.32, 0.72, 0, 1)
  wheelMax: 40,         // most one wheel tick may move the column
  smooth: 0.12,         // how quickly the column catches up with the wheel
  touchMul: 2,          // finger movement is multiplied by this
  snapAfterMs: 220,     // once the column has been still this long it eases so the nearest tile is exactly in the middle
  narrow: 992,          // below this window width the narrow layout is used
};

// The major design domains each project belongs to (only the big ones, so the list at the right stays short).
// Tags can be shared, so picking out one project's tags says something about how it relates to the others.
const DESIGN_TAGS: Record<string, string[]> = {
  p1: ['UX Research', 'Visual Storytelling', 'Editorial Design'],
  p2: ['Product Design', 'Interaction Design'],
  p3: ['Editorial Design'],
  p4: ['Packaging Design', 'Branding'],
  p5: ['3D World Building', 'Interaction Design', 'Visual Storytelling'],
};
// Every tag there is (the list at the right), shuffled each time the page opens so they are not grouped by project
const tagsOf = (id: string) => DESIGN_TAGS[id] ?? [];
const shuffled = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const allTags = () => shuffled(Array.from(new Set(PROJECTS.flatMap((p) => tagsOf(p.id)))));

const SLATE = '#AFAEA7'; // the grey of the labels and the type list on the original
const SMOOTH_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EXPO_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

interface WorksPageProps {
  setView: (view: ViewState) => void;
  setSelectedProject: (id: string | null) => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const mod = (v: number, m: number) => ((v % m) + m) % m;

export const WorksPage: React.FC<WorksPageProps> = ({ setView, setSelectedProject }) => {
  const N = PROJECTS.length;
  const [size, setSize] = useState({ w: 1440, h: 900 });
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selIdx, setSelIdx] = useState(0);             // the selected project: the one nearest the middle of the screen
  const [tagList] = useState(allTags);                  // the tags, in a random order that stays the same while the page is open

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tileRef = useRef(100);
  const hoverRef = useRef<number | null>(null);
  const ys = useRef<number[]>([]);                   // each tile's current y
  const pointer = useRef({ x: -1, y: -1, has: false });
  const canHover = useRef(true);
  const scrolling = useRef(false);

  const narrow = size.w < WORKS.narrow;
  const tile = Math.round(size.h * WORKS.tileVh / 100);          // a tile's width
  const tileH = Math.round(tile * WORKS.aspect);                 // its height: portrait, and the distance between tiles down the column
  tileRef.current = tileH;
  // With few projects the list is shorter than the window, which would leave the column ending part-way down the screen.
  // So the list is repeated as many times as it takes to fill the window (plus a tile either side); the repeats are the
  // same projects and move together when you hover one.
  const copies = Math.max(1, Math.ceil((size.h + 2 * tileH) / (N * tileH)));
  const count = N * copies;
  const countRef = useRef(count);
  countRef.current = count;

  function setHover(i: number | null) {
    if (hoverRef.current === i) return;
    hoverRef.current = i;
    setHoverIdx(i);
  }

  useEffect(() => {
    const calc = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // the page does not scroll: the column does
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  // ── The endless scroll (wheel, touch with momentum, arrow keys), eased ──────────────────────────────────────────
  useEffect(() => {
    canHover.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let target = 0, shown = 0;
    let vel = 0, touching = false, lastTouchY = 0;
    let frame = 0, tick = 0;
    let lastInput = 0, snapped = true, started = false;

    const step = () => tileRef.current;                // the tiles are packed edge to edge
    const moved = () => { lastInput = performance.now(); snapped = false; };

    function place() {
      const s = step(), n = countRef.current, total = n * s;
      if (!started) {                                  // start with the first project in the middle of the screen
        shown = target = -((window.innerHeight - tileRef.current) / 2);
        started = true;
      }
      for (let j = 0; j < n; j++) {
        const el = itemRefs.current[j];
        if (!el) continue;
        const y = mod(j * s - shown + s, total) - s;   // wrapped into [-step, total - step): the column repeats for ever
        ys.current[j] = y;
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      }
    }

    // while the column moves under a still pointer, work out which tile is under it
    function hoverCheck() {
      const p = pointer.current;
      if (!p.has) return;
      const el = document.elementFromPoint(p.x, p.y)?.closest('[data-tile]') as HTMLElement | null;
      setHover(el ? Number(el.dataset.tile) : null);
    }

    // the tile nearest the middle of the screen: it is the "selected" project (its name and tags are shown at the sides),
    // and on a touch screen, where there is no pointer, it is also the one that is "hovered"
    function centreCheck() {
      const mid = window.innerHeight / 2;
      let best = 0, bestD = Infinity;
      for (let j = 0; j < countRef.current; j++) {
        const d = Math.abs(ys.current[j] + tileRef.current / 2 - mid);
        if (d < bestD) { bestD = d; best = j; }
      }
      setSelIdx(best % N);
      if (!canHover.current) setHover(best);
    }

    // once the column has been still for a moment, ease it so the nearest tile sits exactly in the middle of the screen
    function snapToNearest() {
      const mid = window.innerHeight / 2;
      let bestD = Infinity;
      for (let j = 0; j < countRef.current; j++) {
        const d = ys.current[j] + tileRef.current / 2 - mid;
        if (Math.abs(d) < Math.abs(bestD)) bestD = d;
      }
      target += bestD;
      snapped = true;
    }

    function loop() {
      if (!touching && Math.abs(vel) > 0.1) {          // momentum after a flick
        target += clamp(vel * 10, -WORKS.wheelMax, WORKS.wheelMax);
        vel *= 0.95;
        moved();
      }
      if (!snapped && !touching && Math.abs(target - shown) < 0.6 && performance.now() - lastInput > WORKS.snapAfterMs) snapToNearest();
      const diff = target - shown;
      if (Math.abs(diff) > 0.01) shown += diff * WORKS.smooth; else shown = target;
      scrolling.current = Math.abs(diff) > 0.5;
      place();
      tick += 1;
      if (tick % 3 === 0) {
        centreCheck();
        if (canHover.current && scrolling.current) hoverCheck();
      }
      frame = requestAnimationFrame(loop);
    }

    const onWheel = (e: WheelEvent) => { target += clamp(e.deltaY, -WORKS.wheelMax, WORKS.wheelMax); moved(); };
    const onTouchStart = (e: TouchEvent) => { touching = true; vel = 0; lastTouchY = e.touches[0].clientY; moved(); };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const dy = (lastTouchY - y) * WORKS.touchMul;
      lastTouchY = y;
      target += clamp(dy, -WORKS.wheelMax, WORKS.wheelMax);
      vel = dy;
      moved();
    };
    const onTouchEnd = () => { touching = false; if (Math.abs(vel) < 0.5) vel = 0; moved(); };
    const onKey = (e: KeyboardEvent) => {
      const s = step();
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') target += s;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') target -= s;
      else return;
      moved();
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.current = { x: e.clientX, y: e.clientY, has: true };
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointermove', onMove);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
    };
  }, [N]);

  // The project shown at the sides: the one under the pointer, or when the pointer is over no tile, the one the column has
  // stopped on (the tile nearest the middle of the screen).
  const sel = PROJECTS[hoverIdx !== null ? hoverIdx % N : selIdx];
  const selTags = new Set(tagsOf(sel.id));
  const open = (id: string) => { setSelectedProject(id); setView('project-detail'); };
  const rem = 16;

  return (
    <div className="fixed inset-0 z-[30] overflow-hidden select-none" data-works-page>
      {/* LEFT: every tag there is, grey, with the ones the shown project is about picked out in black */}
      <ul className={`absolute left-5 z-20 font-sans text-sm leading-[17px] pointer-events-none ${narrow ? 'top-[190px]' : 'top-1/2 -translate-y-1/2'}`} aria-label="Tags">
        {tagList.map((t) => {
          const on = selTags.has(t);
          return (
            <li key={t} style={{ color: on ? '#1A1A1A' : SLATE, paddingLeft: on ? '0.3rem' : 0, transition: 'all 0.3s ease' }}>{t}</li>
          );
        })}
      </ul>

      {/* RIGHT: the name of the shown project (above the tags on a narrow screen, where the column takes the right edge) */}
      <div className={`absolute z-20 pointer-events-none ${narrow ? 'left-5 top-[110px]' : 'right-5 top-1/2 -translate-y-1/2 text-right'}`}
        style={narrow ? { maxWidth: '45vw' } : { maxWidth: `calc(50vw - ${Math.round(tile / 2) + 44}px)` }}>
        <p key={sel.id} className="font-display text-2xl md:text-3xl tracking-tight leading-[1.1] animate-[fadeUp_.4s_ease-out]">{sel.title}</p>
      </div>

      {/* the column: tiles packed edge to edge, right-aligned on the middle of the page (at the right edge on narrow screens) */}
      <div className="absolute inset-0">
        {Array.from({ length: count }, (_, j) => {
          const i = j % N;                              // which project this tile shows (the list repeats to fill the window)
          const p = PROJECTS[i];
          const cover = coverOf(p);
          // only the tile under the pointer and the one above and the one below it change: the repeats of the same
          // project further along the column stay as they are
          const d = hoverIdx === null ? count : Math.min(mod(j - hoverIdx, count), mod(hoverIdx - j, count));
          const isTarget = d === 0, isAdj = d === 1 && count > 1;
          // narrow screens: fixed widths in rem like the original (but never less than a bit more than the tile itself)
          const nTarget = Math.max(WORKS.targetRem * rem, tile * 1.5), nAdj = tile + (nTarget - tile) * 0.4;
          const width = isTarget ? (narrow ? nTarget : tile * WORKS.target)
            : isAdj ? (narrow ? nAdj : tile * WORKS.adjacent) : tile;
          return (
            <div key={`${p.id}-${j}`} ref={(el) => { itemRefs.current[j] = el; }} data-tile={j}
              onMouseEnter={() => { if (canHover.current) setHover(j); }}
              onMouseLeave={() => { if (canHover.current && !scrolling.current) setHover(null); }}
              className="absolute top-0 will-change-transform"
              style={{
                right: narrow ? 0 : `calc(50% - ${tile / 2}px)`,
                width, height: tileH,
                transition: `width ${WORKS.growMs}ms ${SMOOTH_EASE}`,
              }}>
              <button type="button" onClick={() => open(p.id)} data-cursor="view" aria-label={`${p.title}, ${p.category}`}
                className="relative block w-full h-full overflow-hidden cursor-pointer">
                {cover.src && (
                  <img src={encodeURI(cover.src)} alt="" draggable={false}
                    className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: cover.pos }} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="absolute right-5 bottom-5 font-sans text-sm pointer-events-none" style={{ color: SLATE, display: narrow ? 'none' : undefined }}>Brand &amp; interaction designer</p>
    </div>
  );
};
