import { useEffect, useRef, useState } from 'react';
import { isGateLocked } from './scrollGate';

// Shared scroll-direction signal so the nav and the mascot hide/show in lockstep:
// down hides both, up brings both back. A single hook keeps them from ever
// computing slightly different answers to "are we hidden right now".
export function useNavVisibility(): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const lastByEl = useRef(new WeakMap<object, number>());

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll(e: Event) {
      // The page scrolls on the window, but a project page scrolls inside its own panel: listening in the capture
      // phase hears both, and each scroller keeps its own last position.
      const t = e.target as HTMLElement | Document;
      const isEl = t instanceof HTMLElement && t.scrollHeight > t.clientHeight && t.scrollWidth <= t.clientWidth + 1;
      if (t instanceof HTMLElement && !isEl) return; // a sideways scroller (a wide table), not the page
      const y = isEl ? (t as HTMLElement).scrollTop : window.scrollY;
      const key = isEl ? t : window;
      const prev = lastByEl.current.get(key) ?? y;
      lastByEl.current.set(key, y);
      const dy = y - prev;
      if (isGateLocked()) {
        // A snap-scroll transition (the mascot shrinking into its corner, the
        // hero→about→works handoff, a picker step) is driving scrollY right now,
        // not the user's own scrolling — scrollY climbs fast during these even
        // though nothing should hide. Stay visible until it settles.
        setHidden(false);
      } else if (y <= 4) {
        setHidden(false);
      } else if (dy > 2) {
        setHidden(true);
      } else if (dy < -2) {
        setHidden(false);
      }
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  return hidden;
}
