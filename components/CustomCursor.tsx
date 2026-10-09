import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

// Anything you can click. Over these the dot grows (the "View" cards have their own pill instead).
const INTERACTIVE = 'a, button, summary, label, input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"]), .cursor-pointer';
const CLICK_SCALE = 2; // the 10px dot becomes 20px over something clickable
// Over anything marked data-cursor="view" the dot morphs into a pill (a rectangle with fully rounded ends) saying "View".
const VIEW_W = 100; // the word (~36px) + gap + arrow (15px) is ~56px wide, so this leaves ~22px of blue either side
const VIEW_H = 38;  // and ~13px above and below the capitals
const DOT = 10;
const GROW_MS = 500;   // dot -> pill
const SHRINK_MS = 380; // pill -> dot
const GAP_MS = 140;    // the pointer can cross the 8px gap between two cards without the pill collapsing and re-growing

// Over anything the same blue as the cursor (blue text, a blue button) a solid dot would hide it, so the
// cursor goes see-through there: the blue underneath stays readable and the dot still shows against the page.
const COBALT = [42, 82, 190];
const ON_BLUE_OPACITY = 0.35;
function isCobalt(css: string): boolean {
  const m = css.match(/rgba?\(([^)]+)\)/);
  if (!m) return false;
  const [r, g, b, a = 1] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return a > 0.5 && Math.abs(r - COBALT[0]) + Math.abs(g - COBALT[1]) + Math.abs(b - COBALT[2]) < 45;
}
// Is the pointer over blue text, or over a blue background (the nearest solid background above it)?
function overBlue(target: Element | null): boolean {
  if (!target) return false;
  if (isCobalt(getComputedStyle(target).color) && target.textContent?.trim()) return true;
  let el: Element | null = target;
  for (let i = 0; el && i < 8; i++, el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    const parts = bg.match(/rgba?\(([^)]+)\)/)?.[1].split(/[,\s/]+/).filter(Boolean);
    const alpha = parts && parts[3] !== undefined ? Number(parts[3]) : 1;
    if (parts && alpha > 0.5) return isCobalt(bg); // the first solid background decides
  }
  return false;
}

export const CustomCursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const el = ref.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!el || !ring || !label) return;

    document.documentElement.classList.add('has-custom-cursor');

    let x = 0;
    let y = 0;
    let frame = 0;
    let isView = false;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;

    const render = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    function setView(on: boolean) {
      if (on === isView) return;
      isView = on;
      const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
      const ms = on ? GROW_MS : SHRINK_MS;
      ring!.style.transition = `width ${ms}ms ${ease}, height ${ms}ms ${ease}, transform 200ms ease-out, opacity 180ms ease`;
      ring!.style.width = `${on ? VIEW_W : DOT}px`;
      ring!.style.height = `${on ? VIEW_H : DOT}px`;
      // the word waits for the pill to open up, and leaves first when it closes
      label!.style.transition = on ? 'opacity 260ms ease 170ms' : 'opacity 120ms ease 0ms';
      label!.style.opacity = on ? '1' : '0';
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      const target = e.target as Element | null;
      const clickable = !!target?.closest?.(INTERACTIVE);
      const view = !!target?.closest?.('[data-cursor="view"]');
      if (view) {
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        setView(true);
      } else if (isView && !leaveTimer) {
        leaveTimer = setTimeout(() => { leaveTimer = null; setView(false); }, GAP_MS);
      }
      ring.style.transform = `translate(-50%, -50%) scale(${clickable && !view && !isView ? CLICK_SCALE : 1})`;
      ring.style.opacity = overBlue(target) ? String(ON_BLUE_OPACITY) : '1';
      el.style.opacity = '1';
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onLeave = () => {
      el.style.opacity = '0';
    };

    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('has-custom-cursor');
      if (frame) cancelAnimationFrame(frame);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] pointer-events-none w-2.5 h-2.5 opacity-0 transition-[opacity] duration-200"
      style={{ willChange: 'transform' }}
    >
      {/* The dot. It is centred on the pointer, and morphs into a "View" pill over a project. */}
      <div
        ref={ringRef}
        className="absolute left-1/2 top-1/2 rounded-full bg-cobalt flex items-center justify-center overflow-hidden"
        style={{ width: DOT, height: DOT, transform: 'translate(-50%, -50%) scale(1)', transition: 'transform 200ms ease-out, opacity 180ms ease', willChange: 'width, height' }}
      >
        <span ref={labelRef} className="flex items-center gap-[5px] font-sans text-[15px] uppercase tracking-wide text-white opacity-0 select-none whitespace-nowrap">
          View
          <ArrowUpRight size={15} strokeWidth={2} className="shrink-0" />
        </span>
      </div>
    </div>
  );
};
