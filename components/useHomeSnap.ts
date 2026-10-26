import { RefObject, useEffect } from 'react';
import { isGateLocked, lockGateFor, extendGate } from './scrollGate';

const SNAP_MS = 600; // in line with the mascot's own transition speed

type Zone = 'hero' | 'works';

// The landing page has two stops: the first screen (character, big words, intro line) and the works strip
// straight after it. From the first screen, one scroll gesture carries the page to the strip.
export function useHomeSnap(
  isHome: boolean,
  heroReady: boolean,
  worksRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isHome) return;

    function worksTop() {
      return worksRef.current?.offsetTop ?? Infinity;
    }

    // Only reports a zone when actually PARKED at one of the exact stops. Mid-transition scrollY
    // (e.g. while the strip animates its own way back up) returns null, so we never act on a
    // position another animation is passing through on its way somewhere else.
    function zoneNow(): Zone | null {
      const y = window.scrollY;
      if (Math.abs(y - 0) < 4) return 'hero';
      if (y >= worksTop() - 4) return 'works';
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
          // absorbs whatever momentum is still arriving.
          extendGate();
          onDone?.();
        }
      }
      requestAnimationFrame(step);
    }

    // Returns true if it handled (and thus should preventDefault) the input.
    function intent(down: boolean, up: boolean, ev?: WheelEvent): boolean {
      if (isGateLocked(ev)) {
        // Still-arriving momentum from the same gesture (or another transition — e.g. the
        // strip animating its own way back up) — push the grace window out instead of
        // letting it lapse mid-fling.
        extendGate();
        return true;
      }
      const z = zoneNow();
      if (z === null) return false; // parked nowhere — some other transition owns the page right now

      if (z === 'hero') {
        // The mascot's shrink into the corner is scroll-linked, so animating scrollY all the way
        // to the strip makes it run to completion as a side effect.
        if (down && heroReady) { animateTo(worksTop()); return true; }
        // Too weak to count, or the entrance is still playing — swallow it, otherwise it nudges scrollY
        // off 0 and the exact-match zoneNow() check never matches 'hero' again.
        return true;
      }
      // z === 'works': the strip owns all scroll input once parked there
      // (it steps through the cards, and handles leaving back up to the hero itself).
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
  }, [isHome, heroReady, worksRef]);
}
