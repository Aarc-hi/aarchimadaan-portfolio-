import React, { forwardRef, RefObject, useEffect, useRef } from 'react';
import { PROJECTS } from '../data';
import { Project, ViewState } from '../types';
import { isGateLocked, isNewGesture, lockGateFor, extendGate } from './scrollGate';

interface WorksStripProps {
  setView: (view: ViewState) => void;
  setSelectedProject: (id: string) => void;
  aboutRef?: RefObject<HTMLElement>; // where "up" leads; with none given it leads to the top of the page (the hero)
  // The footer sits just below the strip: after the last card, one more scroll carries the page up to it.
  footerRef: RefObject<HTMLElement>;
}

// How the strip moves: the wheel / trackpad / drag / arrow keys all push a target position and the
// strip eases toward it. Scroll sensitivity, and how quickly it catches up.
const WHEEL_K = 1.2;
const LERP = 0.11;
const PAGE_MOVE_MS = 700;     // strip <-> footer and strip -> intro text
const EDGE_DWELL_MS = 450;    // resting this long on the first / last card makes the next push a hand-off
const INTRO_MS = 900;         // how long one card takes to slide out of the stack
const INTRO_STAGGER_MS = 130; // delay between one card starting and the next

// Cards are portrait (about 3:4) crops of each project's cover (object-fit: cover).
const COVER_OVERRIDE: Record<string, { src?: string; pos?: string }> = {
  p3: { src: '/Sonic magazine visual stock/cover-portrait-2.jpg' },   // the whole picture's height, with the open spread in the middle
  p5: { src: '/3d world building/cover-portrait.jpg' },             // the desk, the fan and the window, cut to a portrait
  p4: { src: '/PAWLY/pawly/cover-centered-2.jpg' },   // the box on its own, in the middle of the picture
};
export function coverOf(p: Project) {
  const o = COVER_OVERRIDE[p.id];
  return {
    src: o?.src || p.coverImage || p.mockups?.[0] || p.images?.[0] || p.pages?.[0] || '',
    pos: o?.pos || '50% 50%',
  };
}

// The first card sits against the left edge, like the reference; the same small inset on the right.
const EDGE = 12; // (the full-width breakout sits a few px left when the page has a scrollbar, so this reads as ~8)
// Phones show one card at a time (78vw wide). Larger screens: 27.6vw wide (3.5 cards across a
// 1440 screen), but never so tall that the card runs up under the nav.
// The cards are 25.6vw wide on a laptop screen (a little under the reference's 27.6vw, to make room for the
// heading above them). --card-w is shared so the heading can sit exactly above the cards, whatever their size.
const CARD_CSS = `
  .works-strip { --card-w: 72vw; --heading-bottom: calc(16px + var(--card-w) * 1.3224 + 24px + 18px); }
  .works-card { width: var(--card-w); }
  @media (min-width: 768px) { .works-strip { --card-w: min(25.6vw, calc((100vh - 250px) * 0.756)); } }
`;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const WorksStrip = forwardRef<HTMLDivElement, WorksStripProps>(
  ({ setView, setSelectedProject, aboutRef, footerRef }, ref) => {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const openRef = useRef({ setView, setSelectedProject });
    openRef.current = { setView, setSelectedProject };

    useEffect(() => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      let x = 0;          // where the strip is drawn
      let target = 0;     // where it is heading
      let max = 0;        // furthest it can go
      let own = false;    // true while this component is animating the page itself
      let dragging = false;
      let dragStartX = 0;
      let dragStartTarget = 0;
      let dragMoved = 0;
      let raf = 0;

      const clamp = (v: number) => Math.min(max, Math.max(0, v));
      const measure = () => {
        max = Math.max(0, track.scrollWidth - section.clientWidth);
        target = clamp(target);
        x = Math.min(x, max);
      };
      const top = () => section.offsetTop;
      const parked = () => Math.abs(window.scrollY - top()) < 4;
      const inFooter = () => window.scrollY > top() + 4;
      const atStart = () => target <= 0.5 && x < 2;
      const atEnd = () => max > 0 && target >= max - 0.5 && x > max - 2;
      const pitch = () => (track.firstElementChild as HTMLElement | null)?.getBoundingClientRect().width ?? 400;

      // Arrival: the cards start stacked on the first card's spot (first card on top), and when the
      // section has settled on screen each one slides out to its own place, one after another.
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let introStart = -1;          // -1 = stacked and waiting for the section to arrive
      let introDone = reduceMotion;
      const cards = () => Array.from(track.children) as HTMLElement[];
      function finishIntro() {
        introDone = true;
        cards().forEach((el) => { el.style.transform = ''; el.style.zIndex = ''; });
      }
      function applyIntro(now: number) {
        const els = cards();
        if (els.length < 2) return;
        const slot = els[1].offsetLeft - els[0].offsetLeft; // one card plus the gap
        els.forEach((el, i) => {
          el.style.zIndex = String(els.length - i);
          if (i === 0) return;
          const p = introStart < 0 ? 0 : Math.min(1, Math.max(0, (now - introStart - (i - 1) * INTRO_STAGGER_MS) / INTRO_MS));
          el.style.transform = `translate3d(${-slot * i * (1 - easeInOutCubic(p))}px, 0, 0)`;
        });
        if (introStart >= 0 && now - introStart > INTRO_MS + (els.length - 2) * INTRO_STAGGER_MS) finishIntro();
      }
      const io = new IntersectionObserver(([entry]) => {
        const r = entry.intersectionRatio;
        if (r >= 0.85 && introStart < 0 && !introDone) introStart = performance.now();
        // Fully out of sight (e.g. back up at the intro text): put the stack back for next time.
        if (r <= 0.02 && introDone && !reduceMotion) { introDone = false; introStart = -1; x = 0; target = 0; }
      }, { threshold: [0, 0.02, 0.5, 0.85, 1] });
      io.observe(section);

      // How long the strip has been resting against its first or last card. After a short dwell, a push
      // counts as a deliberate hand-off even if it is the tail of the same flick that brought it there.
      let edgeAt = 0;
      const dwelled = () => edgeAt > 0 && performance.now() - edgeAt > EDGE_DWELL_MS;

      function frame() {
        x += (target - x) * LERP;
        if (Math.abs(target - x) < 0.1) x = target;
        track!.style.transform = `translate3d(${-x}px, 0, 0)`;
        if (!introDone) applyIntro(performance.now());
        if (atStart() || atEnd()) { if (!edgeAt) edgeAt = performance.now(); } else edgeAt = 0;
        raf = requestAnimationFrame(frame);
      }

      // Moves the page itself (the strip never scrolls the page, it only parks on it).
      function movePageTo(dest: number) {
        own = true;
        lockGateFor(PAGE_MOVE_MS);
        const startY = window.scrollY;
        const dist = dest - startY;
        const t0 = performance.now();
        function step(now: number) {
          const t = Math.min(1, (now - t0) / PAGE_MOVE_MS);
          window.scrollTo(0, startY + dist * easeInOutCubic(t));
          if (t < 1) requestAnimationFrame(step);
          else { own = false; extendGate(); }
        }
        requestAnimationFrame(step);
      }
      const leaveUp = () => movePageTo(aboutRef?.current?.offsetTop ?? 0);                // back up to the hero
      const goFooter = () => movePageTo(document.documentElement.scrollHeight - window.innerHeight); // to the very bottom
      const backToStrip = () => movePageTo(top());

      // Returns true if this gesture belongs to the strip / footer hand-off (so the page must not scroll natively).
      function ours(ev?: WheelEvent): boolean {
        if (own) { extendGate(); return true; }
        if (isGateLocked(ev)) { extendGate(); return parked(); } // another stage's transition owns the page
        if (parked()) return true;
        // A few pixels off the strip's exact spot (a layout shift, a stray native scroll): nudge it back
        // rather than leaving the page loose, which would make the strip stop answering to the wheel.
        if (Math.abs(window.scrollY - top()) < 60) { window.scrollTo(0, top()); return true; }
        return false;
      }

      // One gesture, whatever the device. d>0 is forward (towards the footer). `fresh` is true on the first
      // event of a gesture, so the trailing momentum of the gesture that got us here is never mistaken for a new one.
      function handle(d: number, fresh: boolean) {
        if (d < 0 && atStart()) { if (fresh && d < -20) leaveUp(); return; }
        if (d > 0 && atEnd()) { if (fresh && d > 20) goFooter(); return; }
        target = clamp(target + d * WHEEL_K);
      }

      function onWheel(e: WheelEvent) {
        const fresh = isNewGesture() || dwelled();
        const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (own) { extendGate(); e.preventDefault(); return; }
        if (!isGateLocked(e) && inFooter()) {
          // Down in the footer: let the page scroll natively. Up: carry the page back to the strip.
          if (d < -20 && fresh) { e.preventDefault(); backToStrip(); }
          else if (d < 0) e.preventDefault(); // trailing momentum of that same gesture
          return;
        }
        if (!ours(e)) return;
        e.preventDefault();
        handle(d, fresh);
      }

      function onKey(e: KeyboardEvent) {
        const fwd = ['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key);
        const back = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key);
        const end = e.key === 'End', home = e.key === 'Home';
        if (!fwd && !back && !end && !home) return;
        if (own) { e.preventDefault(); return; }
        if (!isGateLocked() && inFooter()) {
          if (back || home) { e.preventDefault(); backToStrip(); }
          return;
        }
        if (!ours()) return;
        e.preventDefault();
        if (back && atStart()) { leaveUp(); return; }
        if (fwd && atEnd()) { goFooter(); return; }
        if (home) target = 0;
        else if (end) target = max;
        else target = clamp(target + (fwd ? 1 : -1) * pitch());
      }

      // Touch: a swipe in either direction pushes the strip.
      let tX = 0, tY = 0, tTotal = 0, tFresh = false;
      function onTouchStart(e: TouchEvent) { tX = e.touches[0].clientX; tY = e.touches[0].clientY; tTotal = 0; tFresh = true; }
      function onTouchMove(e: TouchEvent) {
        const cx = e.touches[0].clientX, cy = e.touches[0].clientY;
        const dx = tX - cx, dy = tY - cy;
        tX = cx; tY = cy;
        const d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        if (Math.abs(d) < 0.5) return;
        tTotal += d;
        if (own) { e.preventDefault(); return; }
        if (!isGateLocked() && inFooter()) {
          if (d < 0) { e.preventDefault(); if (tFresh && tTotal < -24) { tFresh = false; backToStrip(); } }
          return;
        }
        if (!ours()) return;
        e.preventDefault();
        if (d < 0 && atStart()) { if (tFresh && tTotal < -24) { tFresh = false; leaveUp(); } return; }
        if (d > 0 && atEnd()) { if (tFresh && tTotal > 24) { tFresh = false; goFooter(); } return; }
        tFresh = false;
        target = clamp(target + d * 1.5);
      }

      // Mouse drag (touch uses the handlers above).
      function onPointerDown(e: PointerEvent) {
        if (e.pointerType !== 'mouse' || e.button !== 0 || !parked()) return;
        dragging = true;
        dragMoved = 0;
        dragStartX = e.clientX;
        dragStartTarget = target;
      }
      function onPointerMove(e: PointerEvent) {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        dragMoved = Math.max(dragMoved, Math.abs(dx));
        target = clamp(dragStartTarget - dx * 1.4);
      }
      function onPointerUp() { dragging = false; }
      // A drag that ends over a card must not count as a click on it.
      function onClickCapture(e: MouseEvent) {
        if (dragMoved > 6) { e.preventDefault(); e.stopPropagation(); }
        dragMoved = 0;
      }

      measure();
      raf = requestAnimationFrame(frame);
      const ro = new ResizeObserver(measure);
      ro.observe(track);
      ro.observe(section);
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKey);
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      section.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      section.addEventListener('click', onClickCapture, true);
      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        section.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        section.removeEventListener('click', onClickCapture, true);
      };
    }, [aboutRef, footerRef]);

    const open = (id: string) => { openRef.current.setSelectedProject(id); openRef.current.setView('project-detail'); };

    return (
      <div
        ref={(el) => {
          sectionRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        // Breaks out of the site's max-w-7xl/px-12 content column so the strip can run edge to edge.
        className="works-strip relative w-screen left-1/2 -translate-x-1/2 h-screen overflow-hidden select-none"
      >
        <style>{CARD_CSS}</style>

        <h2
          className="absolute font-display tracking-tight leading-none text-[clamp(1.9rem,3.6vw,3.4rem)]"
          style={{ left: EDGE, bottom: 'var(--heading-bottom)' }}
        >
          Selected <span className="italic text-cobalt">Works</span>
        </h2>

        <div ref={trackRef} className="absolute bottom-4 left-0 flex items-end gap-2 will-change-transform" style={{ paddingLeft: EDGE, paddingRight: EDGE }}>
          {PROJECTS.map((p) => {
            const c = coverOf(p);
            return (
              <div
                key={p.id}
                role="link"
                data-cursor="view"
                tabIndex={0}
                aria-label={p.title}
                onClick={() => open(p.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') open(p.id); }}
                className="works-card group shrink-0 cursor-pointer outline-none"
              >
                {/* name, rolling over to cobalt on hover */}
                <span className="block overflow-hidden mb-2 font-sans text-[11px] md:text-xs uppercase tracking-wide" style={{ height: '1.3em', lineHeight: '1.3em' }}>
                  <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2">
                    <span style={{ height: '1.3em' }}>{p.title}</span>
                    <span style={{ height: '1.3em' }} className="text-cobalt">{p.title}</span>
                  </span>
                </span>
                <div className="relative overflow-hidden bg-black/5" style={{ aspectRatio: '397 / 525' }}>
                  <img
                    src={encodeURI(c.src)}
                    alt={p.title}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    style={{ objectPosition: c.pos }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  }
);

WorksStrip.displayName = 'WorksStrip';
