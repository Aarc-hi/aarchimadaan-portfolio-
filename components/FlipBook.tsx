import React, { useEffect, useRef, useState } from 'react';
import { useMuted } from './soundState';

// A book you flip by clicking. `faces` lists every page in reading order: the front cover, then the left and right
// page of each spread, then the back cover. Two neighbouring faces are the two sides of one sheet.
const TURN_MS = 800;
const EASE = 'cubic-bezier(0.645, 0.045, 0.355, 1)';
const PAGE_SHADOW = '0 28px 44px -14px rgba(0,0,0,0.32), 0 10px 18px -8px rgba(0,0,0,0.18)';

const SOUND_IN_MS = 900;
const SOUND_OUT_MS = 1800;

// `spreadOverlays` maps a spread number (1 = the first spread after the cover) to something laid over the book while that spread is open.
// `spreadAudio` maps a spread number to a sound that fades in when that spread opens and fades out slowly when it is turned away.
export const FlipBook: React.FC<{ faces: string[]; alt: string; pageRatio?: number; spreadOverlays?: Record<number, React.ReactNode>; spreadAudio?: Record<number, string> }> = ({ faces, alt, pageRatio = 0.706, spreadOverlays, spreadAudio }) => {
  const sheets = Math.floor(faces.length / 2);
  const [turned, setTurned] = useState(0); // how many sheets lie on the left
  const [moving, setMoving] = useState<number | null>(null); // the sheet that is turning right now, kept on top
  const busy = useRef(false);

  // The sound of a spread: it starts when the spread opens (a page turn is a click, so the browser allows it) and fades out slowly when the page is turned.
  const muted = useMuted(); // the sound switch in the top nav
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number | null>(null);
  const fadeTo = (a: HTMLAudioElement, to: number, ms: number, done?: () => void) => {
    if (fade.current) window.clearInterval(fade.current);
    const from = a.volume, t0 = performance.now();
    fade.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k >= 1) { window.clearInterval(fade.current!); fade.current = null; done?.(); }
    }, 40);
  };
  const sound = spreadAudio?.[turned];
  useEffect(() => {
    if (sound && !muted) {
      if (!audio.current) { audio.current = new Audio(); audio.current.loop = true; }
      const a = audio.current;
      if (!a.src.endsWith(sound)) { a.src = sound; a.volume = 0; }
      a.play().then(() => fadeTo(a, 1, SOUND_IN_MS)).catch(() => {});
    } else if (audio.current) {
      const a = audio.current;
      fadeTo(a, 0, SOUND_OUT_MS, () => { a.pause(); a.currentTime = 0; });
    }
  }, [sound, muted]);
  useEffect(() => () => {
    const a = audio.current; if (!a) return;
    fadeTo(a, 0, 700, () => a.pause());
  }, []);

  // Decode every page up front, so a page is ready the moment it turns instead of popping in blank.
  useEffect(() => {
    faces.forEach((src) => { const im = new Image(); im.src = src; im.decode?.().catch(() => {}); });
  }, [faces.join('|')]);
  const bookRef = useRef<HTMLDivElement>(null);

  const turn = (dir: 1 | -1) => {
    if (busy.current) return;
    const next = turned + dir;
    if (next < 0 || next > sheets) return;
    busy.current = true;
    setMoving(dir === 1 ? turned : next);
    setTurned(next);
    window.setTimeout(() => { busy.current = false; setMoving(null); }, TURN_MS);
  };

  const onClick = (e: React.MouseEvent) => {
    const r = bookRef.current?.getBoundingClientRect();
    if (!r) return;
    if (turned === 0) turn(1);
    else if (turned === sheets) turn(-1);
    else turn(e.clientX - r.left > r.width / 2 ? 1 : -1);
  };

  const label = turned === 0 ? 'Front cover' : turned === sheets ? 'Back cover' : `Spread ${turned} of ${sheets - 1}`;
  const shift = turned === 0 ? '-25%' : turned === sheets ? '25%' : '0%'; // a closed book sits in the middle, not off to one side
  const face = 'absolute inset-0 w-full h-full object-cover block';

  return (
    <div className={`w-full ${spreadOverlays ? 'pt-9' : ''}`}> {/* room above the book for the line that an overlay writes outside it */}
      <div className="relative mx-auto" style={{ width: 'min(100%, 900px)', aspectRatio: String(pageRatio * 2), perspective: '2400px' }}>
        {/* The shadow sits behind the book, on the table, and never on the pages. It slides with the book (same move, same timing)
            and is one half under each side; a half only fades in once the page has landed on that side, and fades out as soon
            as the last page leaves it, so a turning page never drags a shadow along with it. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `translateX(${shift})`, transition: `transform ${TURN_MS}ms ${EASE}` }}
        >
          <div className="absolute top-0 left-0 w-1/2 h-full" style={{ boxShadow: PAGE_SHADOW, opacity: turned > 0 ? 1 : 0, transition: turned > 0 ? 'opacity 450ms ease 400ms' : 'opacity 250ms ease' }} />
          <div className="absolute top-0 left-1/2 w-1/2 h-full" style={{ boxShadow: PAGE_SHADOW, opacity: turned < sheets ? 1 : 0, transition: turned < sheets ? 'opacity 450ms ease 400ms' : 'opacity 250ms ease' }} />
        </div>
        <div
          ref={bookRef}
          role="button"
          tabIndex={0}
          aria-label={`${alt}: ${label}. Click to turn the page`}
          onClick={onClick}
          onKeyDown={(e) => { if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); }}
          className="relative w-full h-full cursor-pointer select-none outline-none"
          style={{ transform: `translateX(${shift})`, transition: `transform ${TURN_MS}ms ${EASE}`, transformStyle: 'preserve-3d', zIndex: 1 }}
        >
          {/* only the sheets that can be seen (or are about to be) are on the page; the other 8 or so would just sit there as heavy 3D layers */}
          {Array.from({ length: sheets }, (_, i) => {
            if (i < turned - 2 || i > turned + 1) return null;
            const flipped = turned > i;
            return (
              <div
                key={i}
                className="absolute top-0 left-1/2 w-1/2 h-full"
                style={{
                  transformOrigin: 'left center',
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${flipped ? -180 : 0}deg)`,
                  transition: `transform ${TURN_MS}ms ${EASE}`,
                  willChange: moving === i ? 'transform' : undefined,
                  zIndex: moving === i ? sheets + 5 : flipped ? i : sheets - i,
                }}
              >
                {/* the right-hand side of the sheet */}
                <div className="absolute inset-0 overflow-hidden bg-paper" style={{ backfaceVisibility: 'hidden' }}>
                  <img src={faces[i * 2]} alt="" draggable={false} className={face} />
                </div>
                {/* the left-hand side, which shows once the sheet has turned over */}
                <div className="absolute inset-0 overflow-hidden bg-paper" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <img src={faces[i * 2 + 1]} alt="" draggable={false} className={face} />
                </div>
              </div>
            );
          })}
        </div>

        {/* something to play with on one spread: it sits flat over the book (not on the turning pages) once that spread has settled */}
        {!moving && spreadOverlays?.[turned] && <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>{spreadOverlays[turned]}</div>}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 font-sans text-[11px] tracking-wide">
        <button type="button" onClick={() => turn(-1)} disabled={turned === 0} className="cursor-pointer hover:text-cobalt transition-colors disabled:opacity-30 disabled:cursor-default disabled:hover:text-inherit">← Previous</button>
        <span className="opacity-50 min-w-[110px] text-center">{label}</span>
        <button type="button" onClick={() => turn(1)} disabled={turned === sheets} className="cursor-pointer hover:text-cobalt transition-colors disabled:opacity-30 disabled:cursor-default disabled:hover:text-inherit">Next →</button>
      </div>
    </div>
  );
};
