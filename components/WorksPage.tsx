import React, { useEffect, useRef, useState } from 'react';
import { ViewState } from '../types';
import { PROJECTS } from '../data';
import { coverOf } from './WorksStrip';

// ── The Works page ─────────────────────────────────────────────────────────────────────────────────────────────────
// A sideways carousel that loops for ever, made after ondastudio.co/work:
//  - one project is "active", in the middle of the screen, and it is the hero: its name is set large above it, and under it is the
//    line of every tag, with the ones it is about picked out in black. The others sit either side, smaller (idleScale) and faded (idleOpacity);
//  - every cover is the same size, the size of the first project's (Thela Thaila Thikana) cover; the others are cropped to fit;
//  - the wheel / trackpad, a drag, a swipe or the arrow keys move one project at a time; a click on a side project brings it
//    to the middle, and a click on the active one opens it;
//  - at the bottom, a counter (01 / 05).
//
// Everything you are likely to want to change is in this block.
const WORKS = {
  gapVw: 56 / 1440,        // the space between two covers' slots, as a fraction of the window width
  maxWVw: 0.5,             // no cover is wider than this fraction of the window width
  rowTop: 0.5,             // the middle of the covers is this far down the window (0.5 is the exact middle)
  maxHVh: 0.5,             // the height of every cover, as a fraction of the window height
  fallbackAspect: 3 / 4,   // width / height used for a cover until its image has loaded
  idleScale: 0.6,          // the covers that are not active are this fraction of the active one
  idleOpacity: 0.5,        // ...and this faded
  scaleMs: 600,            // how long a cover takes to grow or shrink
  moveMs: 900,             // how long the row takes to move one project along (easing 0.32, 0.72, 0, 1)
  wheelStep: 30,           // how much wheel movement counts as a turn
  wheelLockMs: 550,        // after a turn the wheel is ignored for this long
  dragStep: 60,            // how far (px) a drag has to go to count as a turn
  narrow: 768,             // below this window width the covers and the type are smaller
};

// The major design domains each project belongs to (only the big ones, so the list stays short).
// Tags can be shared, so choosing one of them shows how projects relate to each other.
const DESIGN_TAGS: Record<string, string[]> = {
  p1: ['UX Research', 'Visual Storytelling', 'Editorial Design'],
  p2: ['Product Design', 'Interaction Design'],
  p3: ['Editorial Design'],
  p4: ['Packaging Design', 'Branding'],
  p5: ['3D World Building', 'Interaction Design', 'Visual Storytelling'],
};
const tagsOf = (id: string) => DESIGN_TAGS[id] ?? [];
// Every tag there is (the line under the project), shuffled each time the page opens so they are not grouped by project
const shuffled = <T,>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const allTags = () => shuffled(Array.from(new Set(PROJECTS.flatMap((p) => tagsOf(p.id)))));
const SLATE = '#AFAEA7';
const SMOOTH_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const mod = (v: number, m: number) => ((v % m) + m) % m;
const two = (n: number) => String(n).padStart(2, '0');

interface WorksPageProps {
  setView: (view: ViewState) => void;
  setSelectedProject: (id: string | null) => void;
}

export const WorksPage: React.FC<WorksPageProps> = ({ setView, setSelectedProject }) => {
  const [size, setSize] = useState({ w: 1440, h: 900 });
  const [aspects, setAspects] = useState<Record<string, number>>({});   // each cover's width / height, read from its image
  const [cur, setCur] = useState(0);                                     // the active slide: a whole number that keeps counting past the ends
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [tagList] = useState(allTags);                  // the tags, in a random order that stays the same while the page is open

  const list = PROJECTS;
  const N = list.length;
  const narrow = size.w < WORKS.narrow;

  // ── sizes ──
  const gap = narrow ? 32 : Math.round(size.w * WORKS.gapVw);
  const H = Math.round(size.h * (narrow ? 0.4 : WORKS.maxHVh));            // every cover is this tall
  const maxW = Math.round(size.w * (narrow ? 0.7 : WORKS.maxWVw));
  // every cover is the same size: the size of the Thela Thaila Thikana cover (the first project), and the others are cropped to fit it
  const standard = aspects[PROJECTS[0].id] ?? WORKS.fallbackAspect;
  const boxes = list.map(() => {
    const w = Math.round(Math.min(H * standard, maxW));
    return { slot: w, w, h: H };
  });
  // where each slot's centre is along the row, within one turn of the list, and how long one turn is
  const centres: number[] = [];
  let run = 0;
  boxes.forEach((b) => { centres.push(run + b.slot / 2); run += b.slot + gap; });
  const turn = run || 1;
  const centreOf = (m: number) => Math.floor(m / N) * turn + centres[mod(m, N)];
  const narrowest = Math.min(...boxes.map((b) => b.slot));
  const reach = Math.ceil(size.w / (narrowest * WORKS.idleScale + gap)) + 2;     // how many slides to draw each side of the active one

  const moved = useRef(false);                       // a drag just ended: ignore the click that follows

  useEffect(() => {
    const calc = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // read each cover's proportions from its image
  useEffect(() => {
    PROJECTS.forEach((p) => {
      const src = coverOf(p).src;
      if (!src) return;
      const im = new Image();
      im.onload = () => { if (im.naturalWidth && im.naturalHeight) setAspects((a) => (a[p.id] ? a : { ...a, [p.id]: im.naturalWidth / im.naturalHeight })); };
      im.src = encodeURI(src);
    });
  }, []);

  // the page does not scroll: the row does
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  // ── moving: wheel, keys, drag ──
  useEffect(() => {
    let acc = 0, lastTurn = 0, lastWheel = 0;
    const go = (d: number) => setCur((c) => c + d);

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now - lastWheel > 200) acc = 0;              // a new gesture
      lastWheel = now;
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(acc) >= WORKS.wheelStep && now - lastTurn > WORKS.wheelLockMs) {
        go(acc > 0 ? 1 : -1);
        lastTurn = now; acc = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
      else return;
      e.preventDefault();
    };

    let startX: number | null = null, dx = 0;
    const onDown = (e: PointerEvent) => {
      startX = e.clientX; dx = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (startX === null) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 6) { setDragging(true); setDragDx(dx); }
    };
    const onUp = () => {
      if (startX === null) return;
      startX = null;
      if (Math.abs(dx) > 6) {
        moved.current = true;
        window.setTimeout(() => { moved.current = false; }, 80);
        if (dx <= -WORKS.dragStep) go(1); else if (dx >= WORKS.dragStep) go(-1);
      }
      setDragging(false); setDragDx(0); dx = 0;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const activeTags = new Set(tagsOf(list[mod(cur, N)].id));   // the tags the project in the middle is about
  const open = (id: string) => { setSelectedProject(id); setView('project-detail'); };
  const trackX = size.w / 2 - centreOf(cur) + dragDx;
  const slides = Array.from({ length: reach * 2 + 1 }, (_, k) => cur - reach + k);
  const mono = 'font-mono uppercase tracking-wide';

  return (
    <div className="fixed inset-0 z-[30] overflow-hidden select-none" data-works-page style={{ touchAction: 'none' }}>
      {/* the row: it slides so that the active project is in the middle */}
      <div className="absolute inset-0" style={{ transform: `translate3d(${trackX}px, 0, 0)`, transition: dragging ? 'none' : `transform ${WORKS.moveMs}ms ${SMOOTH_EASE}` }}>
        {slides.map((m) => {
          const k = mod(m, N), p = list[k], b = boxes[k];
          const cover = coverOf(p);
          const active = m === cur;
          const fade = `opacity ${WORKS.scaleMs}ms ease`;
          return (
            <div key={m} className="absolute" style={{ left: centreOf(m) - b.slot / 2, top: `${WORKS.rowTop * 100}%`, width: b.slot, height: 0 }}>
              {/* the hero's name, centred over its cover, set large with room above the cover */}
              <p className={`absolute left-1/2 -translate-x-1/2 text-center font-display tracking-tight leading-[1.1] whitespace-nowrap text-cobalt ${narrow ? 'text-[22px]' : 'text-[28px]'}`}
                style={{ bottom: b.h / 2 + 40, opacity: active ? 1 : 0, transition: fade }}>{p.title}</p>

              {/* the cover: full size when active, smaller and faded otherwise */}
              <div className="absolute left-0" style={{ top: -b.h / 2, width: b.w, height: b.h }}>
                <button type="button" tabIndex={active ? 0 : -1} aria-label={active ? `Open ${p.title}` : `Show ${p.title}`}
                  data-cursor={active ? 'view' : undefined}
                  onClick={() => { if (moved.current) return; if (active) open(p.id); else setCur(m); }}
                  className="relative block w-full h-full overflow-hidden cursor-pointer"
                  style={{ transform: `scale(${active ? 1 : WORKS.idleScale})`, opacity: active ? 1 : WORKS.idleOpacity, transition: `transform ${WORKS.scaleMs}ms ${SMOOTH_EASE}, ${fade}` }}>
                  {cover.src && (
                    <img src={encodeURI(cover.src)} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: cover.pos }} />
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* TAGS: every tag there is, laid in one centred line under the project in the middle, in grey, with the ones that project is about picked out in black */}
      <ul className="absolute -translate-x-1/2 z-20 flex flex-wrap justify-center gap-x-6 gap-y-1 font-sans text-sm leading-[17px] text-center pointer-events-none"
        style={{ left: size.w / 2, top: `calc(${WORKS.rowTop * 100}% + ${H / 2 + 96}px)`, width: Math.min(size.w - 40, 1240) }} aria-label="Tags">
        {tagList.map((t) => {
          const on = activeTags.has(t);
          return <li key={t} style={{ color: on ? '#1A1A1A' : SLATE, transition: 'color 0.3s ease' }}>{t}</li>;
        })}
      </ul>

      {/* the counter */}
      <p className={`absolute left-1/2 -translate-x-1/2 bottom-6 ${mono} text-[11px] pointer-events-none`} style={{ left: size.w / 2 }}>
        {two(mod(cur, N) + 1)} <span style={{ color: SLATE }}>/ {two(N)}</span>
      </p>
    </div>
  );
};
