import React, { useEffect, useRef, useState } from 'react';
import { useMuted, setMuted } from './soundState';
import { setMusic } from './musicState';

// A book you flip by clicking. `faces` lists every page in reading order: the front cover, then the left and right
// page of each spread, then the back cover. Two neighbouring faces are the two sides of one sheet.
const TURN_MS = 800;
const EASE = 'cubic-bezier(0.645, 0.045, 0.355, 1)';
const PAGE_SHADOW = '0 28px 44px -14px rgba(0,0,0,0.32), 0 10px 18px -8px rgba(0,0,0,0.18)';

const SOUND_LEVEL = 0.35;   // how loud a spread's sound gets (0–1)
const AMBIENT_LEVEL = 0.1;  // the quiet bed that plays while the book is still closed: low, so it never gets in the way
const SOUND_IN_MS = 1500;   // a sound fades in over this long while the one before it fades out over SOUND_OUT_MS, so the two cross
const SOUND_OUT_MS = 1700;

// A tiny pool of audio players, so one sound can fade out while the next fades in (a crossfade) instead of one cutting off the other.
type Player = { a: HTMLAudioElement; src: string | null; fade: number | null };
const makePlayer = (onChange: () => void): Player => {
  const a = new Audio(); a.loop = true; a.preload = 'auto'; a.volume = 0;
  a.addEventListener('playing', onChange); a.addEventListener('pause', onChange);   // so the "now playing" panel always shows what is really happening
  return { a, src: null, fade: null };
};
const fadePlayer = (p: Player, to: number, ms: number, done?: () => void) => {
  if (p.fade) window.clearInterval(p.fade);
  const from = p.a.volume, t0 = performance.now();
  p.fade = window.setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    p.a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k >= 1) { window.clearInterval(p.fade!); p.fade = null; done?.(); }
  }, 40);
};

// `spreadOverlays` maps a spread number (1 = the first spread after the cover) to something laid over the book while that spread is open.
// `spreadAudio` maps a spread number to a sound that fades in when that spread opens and crosses into the next one when the page is turned.
// `ambientAudio` is a quiet sound that plays from the moment the book is on the page, until the first page is turned; it then fades away gently.
// `jumpTo` opens the book at a spread (from outside, e.g. a contents list): each new `id` makes it go there.
// `trackInfo` gives the name (and artist) of each sound, by its file; when it is given, a small panel beside the book shows what is playing,
// with a play / pause button.
export const FlipBook: React.FC<{ faces: string[]; alt: string; pageRatio?: number; spreadOverlays?: Record<number, React.ReactNode>; spreadAudio?: Record<number, string>; ambientAudio?: string; trackInfo?: Record<string, { title: string; artist?: string }>; jumpTo?: { spread: number; id: number } | null }> = ({ faces, alt, pageRatio = 0.706, spreadOverlays, spreadAudio, ambientAudio, trackInfo, jumpTo }) => {
  const sheets = Math.floor(faces.length / 2);
  const [turned, setTurned] = useState(0); // how many sheets lie on the left
  const [moving, setMoving] = useState<number | null>(null); // the sheet that is turning right now, kept on top
  const busy = useRef(false);
  const flipped = useRef(false); // set once a page has been turned: the ambient sound is over for good
  useEffect(() => {
    if (!jumpTo) return;
    const next = Math.max(0, Math.min(sheets, jumpTo.spread));
    if (next === turned) return;
    flipped.current = true;
    busy.current = true;
    setMoving(next > turned ? next - 1 : next);   // the sheet nearest the page that lands, kept on top while it turns
    setTurned(next);
    const t = window.setTimeout(() => { busy.current = false; setMoving(null); }, TURN_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTo?.id]);

  // The sound: whichever sound belongs to the book right now (the ambient one while it is closed and untouched, then the one of the spread
  // that is open) fades in, while the one that was playing fades out at the same time. The same sound on two spreads in a row just goes on.
  // The browser may refuse to start a sound before the visitor has done anything; then it starts on their first touch, click or key.
  const muted = useMuted(); // the sound switch in the top nav
  const [paused, setPaused] = useState(false);   // the pause button of the "now playing" panel
  const [, setTick] = useState(0);               // a nudge, so the panel redraws when a sound really starts or stops
  const pool = useRef<Player[]>([]);
  const audible = useRef<Player | null>(null);
  // the sound that belongs to the book right now (whether or not it is switched off): while the book is closed (the front cover, or the back
  // one once it has been closed again) the quiet ambient music plays, and while it is open the sound of the spread that is open
  const closed = turned === 0 || turned === sheets;
  const belongs = closed && ambientAudio ? ambientAudio : spreadAudio?.[turned];
  const wanted = (): { src: string; level: number } | null => {
    if (muted || paused || !belongs) return null;
    return { src: belongs, level: belongs === ambientAudio ? AMBIENT_LEVEL : SOUND_LEVEL };
  };
  const sync = () => {
    if (!pool.current.length) { const bump = () => setTick((n) => n + 1); pool.current = [makePlayer(bump), makePlayer(bump), makePlayer(bump)]; }
    const w = wanted();
    const now = audible.current;
    if (now && w && now.src === w.src) {                                   // the same sound: keep it going (and start it if it was held back)
      if (now.a.paused) now.a.play().then(() => fadePlayer(now, w.level, SOUND_IN_MS)).catch(() => {});
      else fadePlayer(now, w.level, SOUND_IN_MS);
      return;
    }
    if (now) { const gone = now; fadePlayer(gone, 0, SOUND_OUT_MS, () => { if (gone !== audible.current) { gone.a.pause(); gone.src = null; } }); audible.current = null; }
    if (!w) return;
    const next = pool.current.filter((p) => p !== now).sort((x, y) => x.a.volume - y.a.volume)[0];   // the quietest free player
    if (next.fade) { window.clearInterval(next.fade); next.fade = null; }
    next.src = w.src; next.a.src = w.src; next.a.currentTime = 0; next.a.volume = 0;
    audible.current = next;
    next.a.play().then(() => fadePlayer(next, w.level, SOUND_IN_MS)).catch(() => {});
  };
  const syncRef = useRef(sync); syncRef.current = sync;
  useEffect(() => { sync(); }, [turned, muted, paused, ambientAudio, spreadAudio?.[turned]]);
  const info = belongs ? trackInfo?.[belongs] : undefined;
  const isPlaying = !!audible.current && !audible.current.a.paused && audible.current.src === belongs && !paused && !muted;
  // tell the page what is playing (only for a book that has a "now playing" panel, i.e. the one whose music other things follow)
  useEffect(() => {
    if (!trackInfo) return;
    setMusic(isPlaying, isPlaying ? belongs ?? null : null, () => audible.current?.a.currentTime ?? 0);
  });
  useEffect(() => () => { if (trackInfo) setMusic(false, null); }, []);
  const toggleSound = () => { if (isPlaying) setPaused(true); else { setPaused(false); if (muted) setMuted(false); } };
  const playIcon = <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 1.5 L12 7 L3 12.5 Z" /></svg>;
  const pauseIcon = <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><rect x="2.5" y="1.5" width="3" height="11" rx="0.8" /><rect x="8.5" y="1.5" width="3" height="11" rx="0.8" /></svg>;
  const soundBtn = (
    <button type="button" onClick={toggleSound} aria-label={isPlaying ? 'Pause the music' : 'Play the music'}
      className="shrink-0 w-9 h-9 rounded-full bg-cobalt text-white flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 focus-visible:scale-110 outline-none">
      {isPlaying ? pauseIcon : playIcon}
    </button>
  );
  useEffect(() => {
    const go = () => { const p = audible.current; if (p && p.a.paused) syncRef.current(); };
    const evs = ['pointerdown', 'keydown', 'touchstart'] as const;
    evs.forEach((e) => window.addEventListener(e, go, { passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, go));
  }, []);
  useEffect(() => () => {   // leaving the page: everything fades out and stops
    pool.current.forEach((p) => fadePlayer(p, 0, 900, () => p.a.pause()));
  }, []);
  // the sounds of the spreads on either side are fetched ahead of time, so the next one starts the moment the page turns
  useEffect(() => {
    const warm = new Set<string>();
    if (ambientAudio && (turned <= 1 || turned >= sheets - 1)) warm.add(ambientAudio);   // next to a cover: the ambient music may be needed
    [turned - 1, turned, turned + 1].forEach((s) => { const src = spreadAudio?.[s]; if (src) warm.add(src); });
    warm.forEach((src) => { const a = new Audio(); a.preload = 'auto'; a.src = src; });
  }, [turned]);

  // Decode every page up front, so a page is ready the moment it turns instead of popping in blank.
  useEffect(() => {
    faces.forEach((src) => { const im = new Image(); im.src = src; im.decode?.().catch(() => {}); });
  }, [faces.join('|')]);
  const bookRef = useRef<HTMLDivElement>(null);

  const turn = (dir: 1 | -1) => {
    if (busy.current) return;
    const next = turned + dir;
    if (next < 0 || next > sheets) return;
    flipped.current = true;
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
      {/* what is playing, above the book: a play / pause button, then the song and who plays it. The row keeps its height when
          nothing is playing (a spread with no sound), so the book never moves. */}
      {trackInfo && (
        <div className="mx-auto mb-6 min-h-[44px] flex items-center justify-center" style={{ width: 'min(100%, 900px)' }}>
          {/* centred over the book: the book is always in the middle of its frame, open (two pages) or closed (the cover or the back
              slides to the middle), so the middle of the frame is the middle of the book in every state */}
          {info && (
            <div key={belongs} className="flex items-center gap-4 min-w-0 max-w-full" aria-live="polite" style={{ animation: 'npIn 600ms ease both' }}>
              {soundBtn}
              <div className="min-w-0">
                <p className="font-sans text-[11px] tracking-wide text-cobalt leading-none mb-1.5">{isPlaying ? 'Now playing' : 'Paused'}</p>
                <p className="font-display text-lg tracking-tight leading-snug">{info.title}{info.artist ? <span className="font-sans text-[11px] tracking-wide opacity-70 ml-3">{info.artist}</span> : null}</p>
              </div>
            </div>
          )}
        </div>
      )}
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
      <style>{`@keyframes npIn { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
      @media (prefers-reduced-motion: reduce) { [style*="npIn"] { animation: none !important } }`}</style>

      <div className="mt-8 flex items-center justify-center gap-6 font-sans text-[11px] tracking-wide">
        <button type="button" onClick={() => turn(-1)} disabled={turned === 0} className="cursor-pointer hover:text-cobalt transition-colors disabled:opacity-30 disabled:cursor-default disabled:hover:text-inherit">← Previous</button>
        <span className="opacity-50 min-w-[110px] text-center">{label}</span>
        <button type="button" onClick={() => turn(1)} disabled={turned === sheets} className="cursor-pointer hover:text-cobalt transition-colors disabled:opacity-30 disabled:cursor-default disabled:hover:text-inherit">Next →</button>
      </div>
    </div>
  );
};
