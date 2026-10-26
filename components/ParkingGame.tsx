import React, { useEffect, useRef, useState } from 'react';

// The parking page of the Thela Thaila Thikana zine (spread 5). The loose white car on the road is picked up and parked by the reader.
// Everything here is in the page's own pixels (the spread is 1024 x 725) and laid over the book as percentages, so it follows the book's size.
const W = 1024, H = 725;
const PATCH = { x: 726, y: 270, w: 190, h: 100 };      // clean asphalt laid over the car that is printed on the page
const CAR = { x: 744, y: 285, w: 155, h: 72 };         // where that car is, and its size
const START = { x: CAR.x + CAR.w / 2, y: CAR.y + CAR.h / 2 };
const COLS = [131, 209, 284, 361, 437, 514, 592, 668, 745, 822, 897];   // the painted lines between the bays
const ROWS = { top: [125, 260], bottom: [472, 607] } as const;
const CORRECT = 'bottom-4';                              // the fourth bay from the left, in the bottom row

type Slot = { id: string; x0: number; x1: number; y0: number; y1: number };
const SLOTS: Slot[] = (['top', 'bottom'] as const).flatMap((row) =>
  COLS.slice(0, -1).map((x0, i) => ({ id: `${row}-${i + 1}`, x0, x1: COLS[i + 1], y0: ROWS[row][0], y1: ROWS[row][1] })));
const slotAt = (x: number, y: number) => SLOTS.find((s) => x >= s.x0 - 4 && x <= s.x1 + 4 && y >= s.y0 - 4 && y <= s.y1 + 4) || null;
const centreOf = (s: Slot) => ({ x: (s.x0 + s.x1) / 2, y: (s.y0 + s.y1) / 2 });
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export const ParkingGame: React.FC<{ parked: boolean; onParked: (v: boolean) => void }> = ({ parked, onParked }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const home = parked ? centreOf(SLOTS.find((s) => s.id === CORRECT)!) : START;
  const [pos, setPos] = useState({ x: home.x, y: home.y, rot: parked ? -90 : 0 });
  const [dragging, setDragging] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);   // the bay that just got a cross
  const grab = useRef<{ dx: number; dy: number } | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  // How big the book is on screen, and how much room there is to the right of it (the book stays in the middle of the page; the
  // margin beside it is what is left). With enough room the text goes there; with less it goes above the book.
  const [size, setSize] = useState({ w: 900, h: 637 });
  const [room, setRoom] = useState(0);
  useEffect(() => {
    const el = boxRef.current; if (!el) return;
    const measure = () => { setSize({ w: el.clientWidth, h: el.clientHeight }); setRoom(document.documentElement.clientWidth - el.getBoundingClientRect().right - 16); };
    const ro = new ResizeObserver(measure); ro.observe(el);
    window.addEventListener('resize', measure); measure();
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const SIDE_GAP = 28, SIDE_MIN = 120;
  const wide = room - SIDE_GAP >= SIDE_MIN;                       // is there room in the margin on the right
  const sideW = Math.min(175, room - SIDE_GAP);                   // and how wide the text can be there

  // the arrow: from under the line of text in the right margin, bulging out and sweeping back into the right side of the car
  // (or, with no margin, from the line above the book down to the top of the car)
  const textBottom = size.h * 0.27;
  const arrow = (() => {
    if (!wide) return { line: 'M 905 -26 C 996 22, 700 120, 800 262', head: 'M 798 246 L 800 262 L 785.7 254.8' };
    const s = size.w / W;
    const S = { x: size.w + 34, y: textBottom + 12 };
    const E = { x: (CAR.x + CAR.w + 8) * s, y: START.y * s };
    const C1 = { x: S.x + 26, y: S.y + 62 }, C2 = { x: E.x + 96, y: E.y + 30 };
    const dx = E.x - C2.x, dy = E.y - C2.y, len = Math.hypot(dx, dy), bx = -dx / len, by = -dy / len;
    const rot = (a: number) => ({ x: E.x + 15 * (bx * Math.cos(a) - by * Math.sin(a)), y: E.y + 15 * (bx * Math.sin(a) + by * Math.cos(a)) });
    const a = rot((28 * Math.PI) / 180), b = rot((-28 * Math.PI) / 180);
    return { line: `M ${S.x} ${S.y} C ${C1.x} ${C1.y}, ${C2.x} ${C2.y}, ${E.x} ${E.y}`, head: `M ${a.x} ${a.y} L ${E.x} ${E.y} L ${b.x} ${b.y}` };
  })();

  const toPage = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const onDown = (e: React.PointerEvent) => {
    if (parked || wrong) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = toPage(e);
    grab.current = { dx: pos.x - p.x, dy: pos.y - p.y };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!grab.current) return;
    const p = toPage(e);
    const x = p.x + grab.current.dx, y = p.y + grab.current.dy;
    setPos({ x, y, rot: slotAt(x, y) ? -90 : 0 });           // it turns to fit as soon as it is over a bay
  };
  const onUp = () => {
    if (!grab.current) return;
    grab.current = null; setDragging(false);
    const slot = slotAt(pos.x, pos.y);
    if (!slot) { setPos({ ...START, rot: 0 }); return; }       // let go on the road: it goes back
    const c = centreOf(slot);
    setPos({ x: c.x, y: c.y, rot: -90 });
    if (slot.id === CORRECT) { onParked(true); return; }
    setWrong(slot.id);                                         // wrong bay: a cross, then the car goes back
    timer.current = window.setTimeout(() => { setWrong(null); setPos({ ...START, rot: 0 }); }, 1000);
  };
  const again = () => { onParked(false); setWrong(null); setPos({ ...START, rot: 0 }); };

  const wrongSlot = SLOTS.find((s) => s.id === wrong) || null;
  const okSlot = SLOTS.find((s) => s.id === CORRECT)!;

  return (
    <div ref={boxRef} className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 5 }}>
      {/* the clean road over the printed car */}
      <img src="/Municipal market/book/parking/patch.png" alt="" draggable={false} className="absolute select-none"
        style={{ left: pct(PATCH.x, W), top: pct(PATCH.y, H), width: pct(PATCH.w, W), height: pct(PATCH.h, H) }} />

      {/* a tick on the bay once the car is in it */}
      {parked && (
        <span aria-hidden="true" className="absolute flex items-center justify-center rounded-full bg-cobalt text-white"
          style={{ left: pct(centreOf(okSlot).x, W), top: pct(centreOf(okSlot).y - CAR.w / 2 - 14, H), width: pct(34, W), aspectRatio: '1', transform: 'translate(-50%, -50%)', zIndex: 3 }}>
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
      )}

      {/* the car itself */}
      <img src="/Municipal market/book/parking/car.png" alt={parked ? 'The car, parked' : 'A car to park'} draggable={false}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        className="absolute select-none"
        style={{
          left: pct(pos.x, W), top: pct(pos.y, H), width: pct(CAR.w, W),
          transform: `translate(-50%, -50%) rotate(${pos.rot}deg) scale(${dragging ? 1.05 : 1})`,
          transition: dragging ? 'transform 120ms ease' : 'left 260ms cubic-bezier(.22,1,.36,1), top 260ms cubic-bezier(.22,1,.36,1), transform 260ms cubic-bezier(.22,1,.36,1)',
          filter: dragging ? 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
          cursor: parked ? 'default' : dragging ? 'grabbing' : 'grab', touchAction: 'none', pointerEvents: parked ? 'none' : 'auto', zIndex: 2,
        }} />

      {/* a cross on the bay that was tried */}
      {wrongSlot && (
        <svg aria-hidden="true" viewBox="0 0 40 40" className="absolute" style={{ left: pct(centreOf(wrongSlot).x, W), top: pct(centreOf(wrongSlot).y, H), width: pct(46, W), transform: 'translate(-50%, -50%)', zIndex: 3, animation: 'parkCross 260ms cubic-bezier(.34,1.56,.64,1) both' }}>
          <circle cx="20" cy="20" r="19" fill="rgba(255,255,255,0.93)" />
          <path d="M12 12l16 16M28 12L12 28" stroke="#D83B3B" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      )}

      {/* What to do, written outside the zine (not on the page): black while it is still to do, blue once the car is parked.
          It goes in the margin to the right of the book where there is room for it, and above the book where there is not. */}
      <div className="absolute font-sans"
        style={wide
          ? { left: size.w + SIDE_GAP, bottom: size.h - textBottom, width: sideW, textAlign: 'left', fontSize: 14, lineHeight: 1.35, pointerEvents: 'none', color: parked ? '#2A52BE' : '#1A1A1A', transition: 'color 250ms ease' }
          : { right: '3%', bottom: 'calc(100% + 12px)', whiteSpace: 'nowrap', textAlign: 'right', fontSize: 'clamp(11px, 1.45vw, 14px)', lineHeight: 1.3, pointerEvents: 'none', color: parked ? '#2A52BE' : '#1A1A1A', transition: 'color 250ms ease' }}>
        {parked
          ? <>You got it. <button type="button" onClick={again} className="underline underline-offset-4 cursor-pointer" style={{ pointerEvents: 'auto' }}>Again</button></>
          : wrong
            ? <>Oops, try again.</>
            : <>Try to park the car in the right spot by picking it up.</>}
      </div>

      {/* a curvy arrow from that line to the car; it draws itself, and goes once the car is parked */}
      <svg aria-hidden="true" viewBox={wide ? `0 0 ${size.w} ${size.h}` : `0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" style={{ overflow: 'visible', pointerEvents: 'none', opacity: parked ? 0 : dragging ? 0.25 : 1, transition: 'opacity 250ms ease' }}>
        <g fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={arrow.line} pathLength="1" strokeDasharray="1" style={{ animation: 'parkArrow 800ms 200ms cubic-bezier(.4,0,.2,1) both' }} />
          <path d={arrow.head} pathLength="1" strokeDasharray="1" style={{ animation: 'parkArrow 220ms 900ms ease-out both' }} />
        </g>
      </svg>
      <style>{`@keyframes parkCross { from { opacity: 0; transform: translate(-50%, -50%) scale(.4) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
      @keyframes parkArrow { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
      @media (prefers-reduced-motion: reduce) { [style*="parkCross"], [style*="parkArrow"] { animation: none !important } }`}</style>
    </div>
  );
};
