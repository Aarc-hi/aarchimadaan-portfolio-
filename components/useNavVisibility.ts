import { useEffect, useRef, useState } from 'react';
import { isGateLocked } from './scrollGate';

// Shared scroll-direction signal so the nav and the mascot hide/show in lockstep:
// down hides both, up brings both back. A single hook keeps them from ever
// computing slightly different answers to "are we hidden right now".
export function useNavVisibility(): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const dy = y - lastY.current;
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
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return hidden;
}
