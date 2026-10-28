import React, { useRef, useState } from 'react';
import { PEN_BLUE, PEN_INK } from './pens';

// A pen has come in broken, in four pieces. Drag each piece back to its place (the dashed shape); it clicks in when it is close.
// When all four are in, the pen is mended. A small web version of what the player does in VR.
type Part = { id: string; name: string; d: string; start: { x: number; y: number } };

// the pen lies flat, pointing right; each piece is drawn where it belongs
const PARTS: Part[] = [
  { id: 'cap', name: 'cap', d: 'M40 76 H156 a14 14 0 0 1 14 14 V110 a14 14 0 0 1 -14 14 H40 a14 14 0 0 1 -14 -14 V90 a14 14 0 0 1 14 -14 Z', start: { x: 70, y: 112 } },
  { id: 'barrel', name: 'barrel', d: 'M182 84 H388 a12 12 0 0 1 12 12 V104 a12 12 0 0 1 -12 12 H182 a12 12 0 0 1 -12 -12 V96 a12 12 0 0 1 12 -12 Z', start: { x: -60, y: 118 } },
  { id: 'grip', name: 'grip', d: 'M404 84 H452 L474 100 L452 116 H404 Z', start: { x: 40, y: 80 } },
  { id: 'nib', name: 'nib', d: 'M476 100 L560 100 L498 88 Z M476 100 L560 100 L498 112 Z', start: { x: -120, y: 66 } },
];
const SNAP = 26;

// each pen that comes in belongs to someone, and speaks once it is mended (DRAFT lines: replace with the build's)
const PENS = [
  { name: 'The proud, casteist pen', says: 'I have signed for this family for generations. Whose land is it, if not ours?' },
  { name: 'The broken judge’s pen', says: 'I signed the judgments that held the old order up. Now the law is changing under my nib.' },
  { name: 'The socialist pen', says: 'Land to the tiller. I have written that line more times than I can count.' },
];

export const PenRepair: React.FC = () => {
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>(() => Object.fromEntries(PARTS.map((p) => [p.id, p.start])));
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState<string | null>(null);
  const [pen, setPen] = useState(0);                       // which pen is on the bench
  const svg = useRef<SVGSVGElement>(null);
  const grab = useRef({ dx: 0, dy: 0 });

  const done = PARTS.every((p) => placed[p.id]);
  const count = PARTS.filter((p) => placed[p.id]).length;
  const toSvg = (e: React.PointerEvent) => {
    const m = svg.current!.getScreenCTM()!.inverse();
    const pt = svg.current!.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(m);
    return { x: q.x, y: q.y };
  };

  const down = (e: React.PointerEvent, p: Part) => {
    if (placed[p.id]) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const q = toSvg(e);
    grab.current = { dx: pos[p.id].x - q.x, dy: pos[p.id].y - q.y };
    setDrag(p.id);
  };
  const move = (e: React.PointerEvent, p: Part) => {
    if (drag !== p.id) return;
    const q = toSvg(e);
    setPos((s) => ({ ...s, [p.id]: { x: q.x + grab.current.dx, y: q.y + grab.current.dy } }));
  };
  const up = (p: Part) => {
    if (drag !== p.id) return;
    setDrag(null);
    const { x, y } = pos[p.id];
    if (Math.hypot(x, y) <= SNAP) { setPos((s) => ({ ...s, [p.id]: { x: 0, y: 0 } })); setPlaced((s) => ({ ...s, [p.id]: true })); }
  };
  const again = (next: boolean) => { setPos(Object.fromEntries(PARTS.map((p) => [p.id, p.start]))); setPlaced({}); if (next) setPen((n) => (n + 1) % PENS.length); };

  return (
    <div className="max-w-[720px]">
      <svg ref={svg} viewBox="0 0 600 240" className="block w-full h-auto touch-none select-none" role="group" aria-label="A broken pen in four pieces. Drag each piece to its place.">
        {/* where each piece belongs */}
        <g fill="none" stroke={PEN_INK} strokeOpacity="0.28" strokeWidth="1.4" strokeDasharray="5 5">
          {PARTS.map((p) => <path key={p.id} d={p.d} />)}
        </g>
        {/* the pieces */}
        {PARTS.map((p) => {
          const o = pos[p.id], on = placed[p.id], held = drag === p.id;
          return (
            <path key={p.id} d={p.d} transform={`translate(${o.x} ${o.y})`}
              fill={done ? PEN_BLUE : on ? PEN_INK : PEN_INK} fillOpacity={done ? 1 : on ? 0.92 : 0.5}
              onPointerDown={(e) => down(e, p)} onPointerMove={(e) => move(e, p)} onPointerUp={() => up(p)} onPointerCancel={() => up(p)}
              style={{ cursor: on ? 'default' : held ? 'grabbing' : 'grab', transition: held ? 'none' : 'fill 600ms ease, fill-opacity 400ms ease, transform 250ms cubic-bezier(.22,1,.36,1)', filter: held ? 'drop-shadow(0 6px 8px rgba(0,0,0,0.25))' : undefined }} />
          );
        })}
      </svg>
      <div className="mt-4 min-h-[7.5rem]">
        <div className="flex items-start justify-between gap-6 font-sans text-lg">
          <p aria-live="polite" style={{ color: done ? PEN_BLUE : undefined }}>
            {done ? `${PENS[pen].name}, mended. It speaks:` : count === 0 ? `${PENS[pen].name} has come in broken. Put it back together, and it will speak.` : `${count} of ${PARTS.length} pieces back in place.`}
          </p>
          {(count > 0 || done) && <button type="button" onClick={() => again(done)} className="shrink-0 font-sans text-[11px] tracking-wide underline underline-offset-4 cursor-pointer hover:text-cobalt">{done ? 'Another pen' : 'Start again'}</button>}
        </div>
        <p className="font-display text-2xl tracking-tight leading-snug mt-4" style={{ color: PEN_BLUE, opacity: done ? 1 : 0, transition: 'opacity 700ms ease 300ms' }}>“{PENS[pen].says}”</p>
      </div>
    </div>
  );
};
