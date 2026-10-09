import { RefObject, useEffect, useState } from 'react';

// True once the page has scrolled down to (or past) the given section's top edge.
// Used to force the nav hidden for the whole time the Selected Works section is
// pinned, regardless of scroll direction — unlike the rest of the site, that
// section never scrolls the nav back into view.
export function useIsAtOrPast(sectionRef: RefObject<HTMLElement>, enabled: boolean): boolean {
  const [reached, setReached] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReached(false);
      return;
    }
    function check() {
      const el = sectionRef.current;
      setReached(!!el && window.scrollY >= el.offsetTop - 4);
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [sectionRef, enabled]);

  return reached;
}
