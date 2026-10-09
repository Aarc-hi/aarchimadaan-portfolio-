import { RefObject, useEffect } from 'react';
import { isGateLocked, lockGateFor, extendGate } from './scrollGate';

const SNAP_MS = 600; // was 950 — brought in line with the mascot's own transition speed

type Zone = 'hero' | 'about' | 'works';

export function useHomeSnap(
  isHome: boolean,
  heroReady: boolean,
  aboutRef: RefObject<HTMLElement>,
  worksRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isHome) return;

    function tops() {
      return {
        aboutTop: aboutRef.current?.offsetTop ?? Infinity,
        worksTop: worksRef.current?.offsetTop ?? Infinity,
      };
    }

    // Only reports a zone when actually PARKED at one of the three exact stops.
    // Mid-transition scrollY (e.g. while WorksShowcase animates its own leave-upward
    // back to About) returns null, so we never act on a position another animation
    // is passing through on its way somewhere else.
    function zoneNow(): Zone | null {
      const { aboutTop, worksTop } = tops();
      const y = window.scrollY;
      if (Math.abs(y - 0) < 4) return 'hero';
      if (Math.abs(y - aboutTop) < 4) return 'about';
      if (y >= worksTop - 4) return 'works';
      return null;
    }

    function animateTo(target: number, onDone?: () => void) {
      lockGateFor(SNAP_MS);
      const startY = window.scrollY;
      const dist = target - startY;
      const t0 = performance.now();
      function step(now: number) {
        const t = Math.min(1, (now - t0) / SNAP_MS);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, startY + dist * eased);
        if (t < 1) requestAnimationFrame(step);
        else {
          // Animation's done, but don't reopen the gate yet — the grace window
          // (extended in intent() below) absorbs whatever momentum is still arriving.
          extendGate();
          onDone?.();
        }
      }
      requestAnimationFrame(step);
    }

    function goTo(target: Zone) {
      const { aboutTop, worksTop } = tops();
      const dest = target === 'hero' ? 0 : target === 'about' ? aboutTop : worksTop;
      animateTo(dest);
    }

    // Returns true if it handled (and thus should preventDefault) the input.
    function intent(down: boolean, up: boolean, ev?: WheelEvent): boolean {
      if (isGateLocked(ev)) {
        // Still-arriving momentum from the same gesture (or another transition — e.g.
        // WorksShowcase animating its own way back to About) — push the grace window
        // out instead of letting it lapse mid-fling.
        extendGate();
        return true;
      }
      const z = zoneNow();
      if (z === null) return false; // parked nowhere — some other transition owns the page right now

      if (z === 'hero') {
        // First gesture just reveals "Interaction" (MascotHero's own gate, scrollY stays 0).
        // Once that's shown, the very next gesture — any size — drives mascot-to-corner
        // and the About reveal together: animating scrollY all the way to aboutTop makes
        // the mascot's own continuous scroll-linked shrink run to completion as a side effect.
        if (down && heroReady) { goTo('about'); return true; }
        return false;
      }
      if (z === 'about') {
        if (down) { goTo('works'); return true; }
        if (up) { goTo('hero'); return true; }
        // Parked here but the tick was too weak to cross the up/down threshold —
        // swallow it anyway, otherwise it nudges scrollY off aboutTop and the
        // exact-match zoneNow() check above never matches 'about' again.
        return true;
      }
      // z === 'works': WorksShowcase owns all scroll input once parked there
      // (it steps through the project picker, and handles leaving back to About itself).
      return false;
    }

    function onWheel(e: WheelEvent) {
      if (intent(e.deltaY > 0, e.deltaY < -20, e)) e.preventDefault();
    }

    let touchY = 0;
    function onTouchStart(e: TouchEvent) { touchY = e.touches[0].clientY; }
    function onTouchMove(e: TouchEvent) {
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 6) return;
      if (intent(dy > 0, dy < -20)) e.preventDefault();
    }

    function onKey(e: KeyboardEvent) {
      const down = ['ArrowDown', 'PageDown', ' ', 'End'].includes(e.key);
      const up = ['ArrowUp', 'PageUp', 'Home'].includes(e.key);
      if (!down && !up) return;
      if (intent(down, up)) e.preventDefault();
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [isHome, heroReady, aboutRef, worksRef]);
}
