import React, { useEffect, useRef, useState } from 'react';
import { readMusic, useMusicPlaying } from '../musicState';

// Little musical notes that float up and away from the bell of the saxophone while the magazine's music is playing.
// They follow the music: how loud each moment of the track is was measured ahead of time (10 readings a second, in envelopes.json), and the
// louder the part that is playing, the more often a note comes out. When the music stops (paused, switched off, nothing on this spread) the
// notes fade away and no new ones come out.
// the notes are the gold of the saxophone: light, middle and dark brass, taken from the photograph itself
const GOLD = ['#D8B376', '#AC8249', '#784C1B'];
const GOLD_FILL = 'url(#saxGold)';
const ENVELOPES = '/Sonic magazine visual stock/audio/envelopes.json';
const MAX_NOTES = 7;

// Each note leaves in its own direction: five lanes fanning out from straight up to well over to the right, taken in a scrambled order so
// two notes one after the other never go the same way. (Away from the left, where the body of the saxophone is.)
const LANES = [4, 70, 26, 52, 12, 62, 38];   // degrees from straight up, towards the right
type Note = { id: number; kind: 0 | 1 | 2; x0: number; y0: number; dx: number; dy: number; rot: number; size: number; ms: number; sway: number; swayMs: number };

const Glyph: React.FC<{ kind: 0 | 1 | 2 }> = ({ kind }) => (
  <svg viewBox="0 0 20 26" width="100%" height="100%" fill={GOLD_FILL} stroke={GOLD_FILL} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 0 && (<>{/* an eighth note */}
      <ellipse cx="6" cy="20" rx="4.6" ry="3.4" transform="rotate(-22 6 20)" stroke="none" />
      <path d="M10.1 18.6 V3.5 C10.6 7 16.5 8 15.5 15" fill="none" strokeWidth="1.8" />
    </>)}
    {kind === 1 && (<>{/* two eighth notes joined by a beam */}
      <ellipse cx="4.5" cy="20.5" rx="3.8" ry="2.9" transform="rotate(-22 4.5 20.5)" stroke="none" />
      <ellipse cx="14.5" cy="18" rx="3.8" ry="2.9" transform="rotate(-22 14.5 18)" stroke="none" />
      <path d="M8 19.3 V4.5 M18 16.8 V2.2" fill="none" strokeWidth="1.7" />
      <path d="M8 4.5 L18 2.2" fill="none" strokeWidth="3" />
    </>)}
    {kind === 2 && (<>{/* a quarter note */}
      <ellipse cx="7" cy="20.5" rx="4.6" ry="3.4" transform="rotate(-22 7 20.5)" stroke="none" />
      <path d="M11.2 19 V3" fill="none" strokeWidth="1.8" />
    </>)}
  </svg>
);

export const SaxNotes: React.FC = () => {
  const playing = useMusicPlaying();
  const [notes, setNotes] = useState<Note[]>([]);
  const env = useRef<Record<string, number[]> | null>(null);
  const acc = useRef(0.6);
  const nextId = useRef(1);

  // the loudness readings, fetched the first time the music plays
  useEffect(() => {
    if (!playing || env.current) return;
    fetch(encodeURI(ENVELOPES)).then((r) => r.json()).then((j) => { env.current = j; }).catch(() => { env.current = {}; });
  }, [playing]);

  useEffect(() => {
    if (!playing) { const t = window.setTimeout(() => setNotes([]), 700); return () => window.clearTimeout(t); }
    const tick = window.setInterval(() => {
      const { src, time } = readMusic();
      const key = src ? decodeURI(src).split('/').pop()!.replace(/\.mp3$/i, '') : '';
      const e = env.current?.[key];
      const level = e && e.length ? e[Math.floor(time * 10) % e.length] : 0.5;   // 0 (quiet) to 1 (loud) at this moment of the track
      acc.current += 0.02 + 0.15 * level * level;                                // a note comes out each time this adds up to 1
      if (acc.current < 1) return;
      acc.current -= 1;
      const id = nextId.current++;
      const lane = LANES[id % LANES.length] + (Math.random() - 0.5) * 8;         // its direction, in degrees from straight up
      const dist = 150 + Math.random() * 120;                                    // how far it goes
      const a = (lane * Math.PI) / 180;
      const note: Note = {
        id, kind: (id % 3) as 0 | 1 | 2,
        x0: (Math.random() - 0.5) * 26, y0: (Math.random() - 0.5) * 12,          // it starts somewhere across the mouth of the bell
        dx: dist * Math.sin(a), dy: dist * Math.cos(a),
        rot: (Math.random() - 0.5) * 50, size: 15 + Math.random() * 9 + level * 5,
        ms: 3600 + Math.random() * 2200,                                          // and takes its own time, so they spread out
        sway: 5 + Math.random() * 7, swayMs: 1100 + Math.random() * 900,
      };
      setNotes((n) => [...n.slice(-(MAX_NOTES - 1)), note]);
      window.setTimeout(() => setNotes((n) => n.filter((x) => x.id !== id)), note.ms + 80);
    }, 100);
    return () => window.clearInterval(tick);
  }, [playing]);

  return (
    <div aria-hidden="true" className="absolute pointer-events-none" style={{ left: '79%', top: '56%', width: 0, height: 0, zIndex: 2, opacity: playing ? 1 : 0, transition: 'opacity 600ms ease' }}>
      {/* the gold, shared by every note (in the notes' own units, so it also works on the straight stems) */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="saxGold" gradientUnits="userSpaceOnUse" x1="2" y1="1" x2="16" y2="25">
            <stop offset="0" stopColor={GOLD[0]} /><stop offset="0.5" stopColor={GOLD[1]} /><stop offset="1" stopColor={GOLD[2]} />
          </linearGradient>
        </defs>
      </svg>
      {notes.map((n) => (
        <span key={n.id} className="sax-note absolute block" style={{ left: n.x0 - n.size / 2, top: n.y0 - n.size, width: n.size, height: n.size * 1.3, ['--dx' as string]: `${n.dx}px`, ['--dy' as string]: `${n.dy}px`, ['--rot' as string]: `${n.rot}deg`, animation: `saxNote ${n.ms}ms cubic-bezier(.35,.55,.5,1) both` }}>
          {/* the sideways wobble is a second movement on the inside, so it adds to the way the note is travelling */}
          <span className="block w-full h-full" style={{ ['--sw' as string]: `${n.sway}px`, animation: `saxSway ${n.swayMs}ms ease-in-out infinite alternate` }}><Glyph kind={n.kind} /></span>
        </span>
      ))}
      <style>{`@keyframes saxNote {
        0% { opacity: 0; transform: translate(0, 0) scale(.55) rotate(0deg) }
        14% { opacity: .95 }
        55% { opacity: .9; transform: translate(calc(var(--dx) * .5), calc(var(--dy) * -.55)) scale(1) rotate(calc(var(--rot) * .5)) }
        100% { opacity: 0; transform: translate(var(--dx), calc(var(--dy) * -1)) scale(1.08) rotate(var(--rot)) }
      }
      @keyframes saxSway { from { transform: translateX(calc(var(--sw) * -1)) } to { transform: translateX(var(--sw)) } }
      @media (prefers-reduced-motion: reduce) { .sax-note { display: none } }`}</style>
    </div>
  );
};
