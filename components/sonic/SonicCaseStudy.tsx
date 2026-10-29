import React, { useEffect, useState } from 'react';
import { Block, labelCls } from '../pawly/shared';

// The extra sections of the Sonic page. Everything on them comes from the magazine's own pages (the contents page, the colours printed
// on them and what their layouts do); nothing here is a claim about how it was made. The pages themselves are shown once, in the
// magazine below, and these sections open it at the right spread instead of showing the pages again.

// ── the sound of the magazine ──
// A quiet saxophone plays from the moment the project is opened, until the first page is turned; it then fades away gently and each spread
// has its own short clip (the hook, about 10 to 15 seconds), which crosses into the next one as the pages turn. The clip files go in
// public/Sonic magazine visual stock/audio/ under the names below. A spread with no file is simply silent, and a missing file is skipped.
const AUDIO = '/Sonic magazine visual stock/audio/';
const clip = (name: string) => encodeURI(`${AUDIO}${name}.mp3`);
export const SONIC_AMBIENT = clip('saxophone');
export const SONIC_AUDIO: Record<number, string> = {
  1: clip('jazz'), 2: clip('jazz'),                    // up to page 5: some jazz
  3: clip('rnb-sza'), 4: clip('rnb-sza'),              // R&B (pages 6 to 9): a song by SZA
  5: clip('bruno-mars'),                               // pages 10 and 11: a song by Bruno Mars
  6: clip('red-hot-chili-peppers-scar-tissue'),        // Alternative (pages 12 and 13)
  7: clip('cocteau-twins'), 8: clip('cocteau-twins'),  // Shoegaze (pages 14 to 17)
  9: clip('radiohead-house-of-cards'),                 // Rock (pages 18 and 19)
  10: clip('joy-division'),                            // Post-punk (pages 20 and 21)
  11: clip('the-beatles'),                             // the Beatles (pages 22 and 23)
};

// The name of each clip, for the "now playing" panel beside the magazine (the song, and who plays it where that is known).
export const SONIC_TRACKS: Record<string, { title: string; artist?: string }> = {
  [clip('saxophone')]: { title: 'Evening In The North' },
  [clip('jazz')]: { title: 'Portrait of a Time' },
  [clip('rnb-sza')]: { title: 'Saturn', artist: 'SZA' },
  [clip('bruno-mars')]: { title: 'Leave the Door Open', artist: 'Silk Sonic' },
  [clip('red-hot-chili-peppers-scar-tissue')]: { title: 'Scar Tissue', artist: 'Red Hot Chili Peppers' },
  [clip('cocteau-twins')]: { title: 'Cherry-coloured Funk', artist: 'Cocteau Twins' },
  [clip('radiohead-house-of-cards')]: { title: 'House of Cards', artist: 'Radiohead' },
  [clip('joy-division')]: { title: 'Disorder', artist: 'Joy Division' },
  [clip('the-beatles')]: { title: 'I’m Happy Just to Dance With You', artist: 'The Beatles' },
};

// ── the artists the issue features, in page order, with the pages they are on and the members of each band. Silk Sonic, Cocteau Twins,
// Joy Division and the Beatles are named in the magazine's own captions or text; the Red Hot Chili Peppers (the line-up of the Scar Tissue
// years) and Radiohead are added here. ──
const ARTISTS = [
  { name: 'Silk Sonic', who: 'Bruno Mars and Anderson .Paak', pages: '10–11', spread: 5 },
  { name: 'Red Hot Chili Peppers', who: 'Anthony Kiedis, Flea, John Frusciante and Chad Smith', pages: '12–13', spread: 6 },
  { name: 'Cocteau Twins', who: 'Elizabeth Fraser, Robin Guthrie and Simon Raymonde', pages: '16–17', spread: 8 },
  { name: 'Radiohead', who: 'Thom Yorke, Jonny Greenwood, Colin Greenwood, Ed O’Brien and Philip Selway', pages: '18–19', spread: 9 },
  { name: 'Joy Division', who: 'Ian Curtis, Bernard Sumner, Peter Hook and Stephen Morris', pages: '20–21', spread: 10 },
  { name: 'The Beatles', who: 'John Lennon, Paul McCartney, George Harrison and Ringo Starr', pages: '22–23', spread: 11 },
];

const Artists: React.FC<{ onOpen: (spread: number) => void }> = ({ onOpen }) => (
  <div className="border-t border-black/15">
    {ARTISTS.map((a) => (
      <button key={a.name} type="button" onClick={() => onOpen(a.spread)}
        className="group w-full grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_8rem] items-center gap-x-6 gap-y-1 py-3.5 border-b border-black/15 text-left cursor-pointer transition-colors hover:text-cobalt focus-visible:text-cobalt outline-none">
        <span className="font-display text-lg md:text-3xl tracking-tight leading-tight">{a.name}</span>
        <span className="font-sans text-lg leading-snug opacity-70">{a.who}</span>
        <span className={`${labelCls} whitespace-nowrap md:text-right`}>Pages {a.pages} <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span></span>
      </button>
    ))}
  </div>
);

// ── a look for each genre: the colour it is printed in and what its spread does ──
const GENRES = [
  { name: 'R&B', spread: 3, pages: '6–7', bg: '#1C2C6C', fg: '#FFFDF5',
    text: 'Blue is the colour of the blues, where R&B comes from. A deep, dark blue gives it the calm, smooth feel of a late evening.' },
  { name: 'Alternative', spread: 6, pages: '12–13', bg: '#FECF1F', fg: '#1A1A1A',
    text: 'Yellow is loud and restless, and it stands apart from everything around it. That is how alternative sets itself apart from the mainstream.' },
  { name: 'Shoegaze', spread: 7, pages: '14–15', bg: '#F26317', fg: '#FFFDF5',
    text: 'Orange is a warm, hazy glow, like the blur of guitars in shoegaze. It sounds more like a dream than a shout, and the colour does the same.' },
  { name: 'Rock', spread: 9, pages: '18–19', bg: '#1A1B20', fg: '#FFFDF5',
    text: 'Black is the classic colour of rock: amps, leather and a dark stage. It needs no other colour, because its power comes from contrast.' },
  { name: 'Post-punk', spread: 10, pages: '20–21', bg: '#F12F37', fg: '#FFFDF5',
    text: 'Red is tension and alarm. It matches the anxious, urgent edge of post-punk, which was born out of rebellion.' },
];

const Genres: React.FC<{ onOpen: (spread: number) => void }> = ({ onOpen }) => {
  // Left alone, the panels open one after another on a loop, so it is clear that they change. While the mouse is over them (or one has the
  // focus) they wait on the one you chose, and they carry on when you move away.
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold) return;
    const t = window.setTimeout(() => setI((c) => (c + 1) % GENRES.length), 4200);
    return () => window.clearTimeout(t);
  }, [hold, i]);
  return (
    <div className="flex flex-col md:flex-row gap-2 md:h-[320px]" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      {GENRES.map((g, n) => {
        const on = n === i;
        return (
          <div key={g.name} role="button" tabIndex={0} aria-expanded={on} onMouseEnter={() => setI(n)} onFocus={() => setI(n)} onClick={() => setI(n)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setI(n); } }}
            className={`relative overflow-hidden rounded-xl cursor-pointer outline-none transition-[flex-grow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] min-h-[170px] md:min-h-0 ${on ? 'md:flex-[3.6]' : 'md:flex-1'}`}
            style={{ background: g.bg, color: g.fg }}>
            {/* the name, turned on its side, while the panel is shut */}
            <p className="hidden md:block absolute left-1/2 bottom-5 -translate-x-1/2 font-display text-lg tracking-tight leading-none whitespace-nowrap transition-opacity duration-500" style={{ writingMode: 'vertical-rl', transform: 'translateX(-50%) rotate(180deg)', opacity: on ? 0 : 1 }}>{g.name}</p>
            {/* the hex code of its colour, at the top of the panel while it is shut */}
            <p className="hidden md:block absolute top-5 left-1/2 font-sans text-[11px] tracking-wide tabular-nums leading-none transition-opacity duration-500" style={{ transform: 'translateX(-50%)', opacity: on ? 0 : 1 }}>{g.bg}</p>
            {/* what the panel says; fixed width so the words do not rewrap while it opens */}
            <div className="p-6 md:absolute md:inset-y-0 md:left-0 md:w-[360px] md:p-7 flex flex-col justify-between transition-opacity duration-500" style={{ opacity: on ? 1 : undefined }}>
              <div className={`md:transition-opacity md:duration-500 ${on ? 'md:opacity-100 md:delay-200' : 'md:opacity-0'}`}>
                <p className="font-display text-3xl tracking-tight leading-tight">{g.name}</p>
                <p className="font-sans text-[11px] tracking-wide tabular-nums leading-none mt-2 mb-4">{g.bg}</p>
                <p className="font-sans text-lg leading-snug">{g.text}</p>
              </div>
              <button type="button" tabIndex={on ? 0 : -1} onClick={(e) => { e.stopPropagation(); onOpen(g.spread); }}
                className={`self-start mt-5 font-sans text-[11px] tracking-wide underline underline-offset-4 cursor-pointer md:transition-opacity md:duration-500 ${on ? 'md:opacity-100 md:delay-300' : 'md:opacity-0 md:pointer-events-none'}`}>
                Pages {g.pages}: open in the magazine →
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── the two typefaces, set the way the Pawly page sets its fonts: a big "Aa", the name, and the alphabet ──
// Futura PT is not on most computers, so it falls back to Futura, then to Jost (an open typeface in the same style, loaded in index.html).
const LOW = 'abcdefghijklmnopqrstuvwxyz';
const NUM = '0123456789';
const TYPEFACES = [
  { id: 'futura', rank: '01', role: 'Headings', name: 'Futura PT', style: { fontFamily: '"Futura PT", Futura, Jost, "Century Gothic", sans-serif', fontWeight: 400 } as React.CSSProperties },
  { id: 'helvetica', rank: '02', role: 'Body text', name: 'Helvetica Neue', style: { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 400 } as React.CSSProperties },
];
// Everything in a row is sized in em off one unit, so the "Aa" and the lines beside it scale together; `text-box` trims the text to exactly
// the cap line and the baseline, so the name and the alphabet line up with the top and the foot of the "Aa".
const TRIM = { textBox: 'trim-both cap alphabetic' } as React.CSSProperties;

const Type: React.FC = () => (
  <div className="flex flex-col gap-14 md:gap-16 mt-8 md:mt-14" style={{ fontSize: 'clamp(9px,1.25vw,15px)' }}>
    {TYPEFACES.map((f) => (
      <div key={f.id} className="grid md:grid-cols-[minmax(0,20em)_minmax(0,1fr)] gap-x-[5em] gap-y-[2em]">
        <div className="min-w-0 text-ink md:flex md:items-end">
          <div className="min-w-0">
            <p className="font-sans mb-[1.2em]" style={{ fontSize: '11px', lineHeight: 1.4 }}>{f.rank} · {f.role}</p>
            <p className="break-words" style={{ ...f.style, ...TRIM, fontSize: '30px', lineHeight: 1.1 }}>{f.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,15em)_minmax(0,1fr)] gap-x-[2em] items-stretch">
          <p className="leading-none text-cobalt" style={{ ...f.style, ...TRIM, fontSize: '12em' }}>Aa</p>
          <div className="min-w-0 flex flex-col justify-end gap-[0.5em] text-ink" style={f.style}>
            <p className="break-words" style={{ ...TRIM, fontSize: '18px', lineHeight: 1.2 }}>{LOW}</p>
            <p style={{ ...TRIM, fontSize: '18px', lineHeight: 1.2 }}>{NUM}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SONIC_NAV = [
  { id: 'sonic-artists', label: 'Featured artists' },
  { id: 'sonic-genres', label: 'A look for each genre' },
  { id: 'sonic-type', label: 'Typography' },
];

export const SonicCaseStudy: React.FC<{ onOpen: (spread: number) => void }> = ({ onOpen }) => (
  <>
    <Block id="sonic-artists" n="02" kicker="Featured artists" title="Featured artists"
      intro="**Six artists** are featured in the first issue, from Silk Sonic to the Beatles. Pick one to open its pages in the magazine below.">
      <Artists onOpen={onOpen} />
    </Block>
    <Block id="sonic-genres" n="03" kicker="A look for each genre" title="A look for each genre"
      intro="Every genre has its **own colour**, chosen to match **how the genre feels**, so you can tell where you are before you read a word.">
      <Genres onOpen={onOpen} />
    </Block>
    <Block id="sonic-type" n="04" kicker="Typography" title="Typography"
      intro="Two typefaces carry the whole magazine: **Futura PT** for the headings and **Helvetica Neue** for the body text.">
      <Type />
    </Block>
  </>
);
