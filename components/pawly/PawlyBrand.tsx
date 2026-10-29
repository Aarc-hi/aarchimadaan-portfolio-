import React, { useEffect, useRef, useState } from 'react';
import { BEATS, FONTS, IMG, PALETTE } from './pawlyData';
import { Block, labelCls, pill } from './shared';
import { Marked } from '../Marked';
import { Ruler } from 'lucide-react';

// ── 01 What is Pawly ─────────────────────────────────────────────
export const WhatIsPawly: React.FC = () => (
  <Block id="what" n="01" kicker="The project" title="What is Pawly?">
    {/* the product and the concept, side by side in two rectangles */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {BEATS.map((b) => (
        <div key={b.id} className="border-2 border-cobalt/35 text-ink p-6 md:p-8 flex flex-col gap-4">
          <p className={labelCls}>{b.label}</p>
          <p className="font-sans text-lg leading-relaxed"><Marked text={b.text} /></p>
        </div>
      ))}
    </div>
    <figure className="mt-14">
      <img src={IMG.mockup} alt="Pawly pack, front, back and side" className="w-full rounded-2xl" />
    </figure>
  </Block>
);

// ── 02 Colour palette ────────────────────────────────────────────
export const ColourPalette: React.FC = () => {
  const [focus, setFocus] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (hex: string, id: string) => {
    try { navigator.clipboard?.writeText(hex); } catch { /* clipboard unavailable */ }
    setCopied(id); window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1400);
  };

  return (
    <Block id="colour" n="02" kicker="Colour" title="Colour palette">
      <div className="flex flex-wrap gap-4 md:gap-5" onMouseLeave={() => setFocus(null)}>
        {PALETTE.map((p) => (
          <button key={p.id} type="button" aria-label={`${p.name} ${p.hex}`} onMouseEnter={() => setFocus(p.id)} onFocus={() => setFocus(p.id)} onBlur={() => setFocus(null)} onClick={() => copy(p.hex, p.id)}
            className="text-left cursor-pointer focus:outline-none">
            <span className={`block w-[112px] h-[72px] md:w-[132px] md:h-[84px] rounded-md border border-black/10 transition-all duration-300 ${focus === p.id ? 'ring-2 ring-cobalt ring-offset-2 ring-offset-paper -translate-y-1' : ''}`} style={{ background: p.hex }} />
            <span className="block font-sans text-[11px] font-bold tabular-nums pt-2">{copied === p.id ? 'Copied' : p.hex}</span>
            <span className={`${labelCls} block pt-0.5 tabular-nums`}>{p.cmyk}</span>
          </button>
        ))}
      </div>
    </Block>
  );
};

// ── 03 Fonts ─────────────────────────────────────────────────────
const LOW = 'abcdefghijklmnopqrstuvwxyz';
const NUM = '0123456789';

// How each face is set: its CSS, and the sizes. The "Aa" is Pawly orange.
const SPEC: Record<string, { style: React.CSSProperties }> = {
  calibri: { style: { fontFamily: 'Carlito, Calibri, sans-serif', fontWeight: 400 } },
  helvetica: { style: { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 400 } },
};

// Everything in a typeface row is sized in em off one unit (`u`), so the "Aa" and the lines beside it scale together. The text on the
// right runs from the cap line of the name down to the baseline of the digits, and `text-box` trims both ends to exactly that, so it
// lines up with the top and the baseline of the "Aa".
const TRIM = { textBox: 'trim-both cap alphabetic' } as React.CSSProperties;

export const FontsUsed: React.FC = () => (
  <Block id="fonts" n="03" kicker="Typography" title="Typography">
    <div className="flex flex-col gap-14 md:gap-16 mt-8 md:mt-14" style={{ fontSize: 'clamp(9px,1.25vw,15px)' }}>
      {FONTS.map((f) => (
        <div key={f.id} className="grid md:grid-cols-[minmax(0,20em)_minmax(0,1fr)] gap-x-[5em] gap-y-[2em]">
          {/* where the font ranks and what it does, then its name, which sits on the baseline of the Aa */}
          <div className="min-w-0 text-ink md:flex md:items-end">
            <div className="min-w-0">
              <p className="font-sans mb-[1.2em]" style={{ fontSize: '11px', lineHeight: 1.4 }}>{f.rank} · {f.role}</p>
              <p className="break-words" style={{ ...SPEC[f.id].style, ...TRIM, fontSize: '30px', lineHeight: 1.1 }}>{f.name}</p>
            </div>
          </div>
          {/* Aa, then a–z and 0–9 beside it: the lines are small, close together, and sit on the baseline of the Aa */}
          <div className="grid grid-cols-[minmax(0,15em)_minmax(0,1fr)] gap-x-[2em] items-stretch">
            <p className="leading-none text-[#F7923C]" style={{ ...SPEC[f.id].style, ...TRIM, fontSize: '12em' }}>Aa</p>
            <div className="min-w-0 flex flex-col justify-end gap-[0.5em] text-ink" style={SPEC[f.id].style}>
              <p className="break-words" style={{ ...TRIM, fontSize: '18px', lineHeight: 1.2 }}>{LOW}</p>
              <p style={{ ...TRIM, fontSize: '18px', lineHeight: 1.2 }}>{NUM}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Block>
);
// ── 04 Logo: version switcher, with construction guidelines on the logo ──
const BG_HEX = '#FFFDF5'; // the logo is shown on the paper colour
const VERSIONS = [
  { id: 'primary', label: 'Primary', src: IMG.logoPrimary, ink: '#494441', paw: '#CAB9A3', note: 'Charcoal lettering with a sand paw. The master version.' },
  { id: 'inverse', label: 'Inverse', src: IMG.logoInverse, ink: '#CAB9A3', paw: '#494441', note: 'Sand lettering with a charcoal paw, the colours swapped.' },
  { id: 'mark', label: 'Paw only', src: IMG.paw, ink: '#CAB9A3', paw: '#CAB9A3', note: 'The paw replaces the A, so it works on its own.' },
];

// Construction drawing laid over the logo, in the style of a logo-construction sheet: thin guide lines run out across the panel
// from the letter edges and heights.
// Everything is in the logo image's own pixels (1400 x 454 for the wordmark, 700 x 755 for the paw), measured from the files.
type Geo = { vb: [number, number, number, number]; xs: number[]; ys: number[] };
const GEO: { word: Geo; mark: Geo } = {
  word: {
    vb: [-3000, -1000, 7400, 2454], // wide, so the guide lines run out to the edges of the panel (it clips them)
    xs: [10, 331, 394, 663, 701, 973, 1002, 1122, 1178, 1376],   // 331 and 701: the paw's side toes; 1002 and 1122: the sides of the L's stem
    ys: [14, 63, 152, 196, 436],                      // 63: top of the paw's toes, 196: top of its pad
  },
  mark: {
    vb: [-1500, -800, 3700, 2355],
    xs: [14, 95, 615, 698],
    ys: [18, 275, 745],
  },
};

const LogoGuides: React.FC<{ wordmark: boolean; onDark: boolean }> = ({ wordmark, onDark }) => {
  const g = wordmark ? GEO.word : GEO.mark;
  const [vx, vy, vw, vh] = g.vb;
  const imgW = wordmark ? 1400 : 700, imgH = wordmark ? 454 : 755;
  const ink = onDark ? '#FFFDF5' : '#1A1A1A';
  const s = { fill: 'none', vectorEffect: 'non-scaling-stroke' as const, style: { stroke: ink, transition: 'stroke 700ms ease-in-out' } };
  return (
    <svg aria-hidden="true" viewBox={`${vx} ${vy} ${vw} ${vh}`} className="absolute pointer-events-none overflow-visible"
      style={{ left: `${(vx / imgW) * 100}%`, top: `${(vy / imgH) * 100}%`, width: `${(vw / imgW) * 100}%`, height: `${(vh / imgH) * 100}%` }}>
      {g.xs.map((x) => <line key={`x${x}`} x1={x} x2={x} y1={vy} y2={vy + vh} {...s} strokeWidth={1} strokeDasharray="7 5" opacity={0.55} />)}
      {g.ys.map((y) => <line key={`y${y}`} x1={vx} x2={vx + vw} y1={y} y2={y} {...s} strokeWidth={1} strokeDasharray="7 5" opacity={0.55} />)}
    </svg>
  );
};

export const LogoSection: React.FC = () => {
  const [ver, setVer] = useState('primary');
  const [guides, setGuides] = useState(false);
  const v = VERSIONS.find((x) => x.id === ver)!;
  const wordmark = v.id !== 'mark';
  const inverse = v.id === 'inverse';
  const ease = 'opacity 700ms ease-in-out';
  return (
    <Block id="logo" n="04" kicker="Identity" title="Logo">
      <div className="relative rounded-2xl border border-black/10 overflow-hidden h-[260px] md:h-[360px] flex items-center justify-center p-8" style={{ backgroundColor: BG_HEX }}>
        <div className={`relative ${wordmark ? 'w-[80%]' : 'h-full'}`}>
          {wordmark ? (
            <>
              {/* both versions are stacked and cross-fade, so the switch is one smooth dissolve */}
              <img src={IMG.logoPrimary} alt="Pawly logo, primary" className="w-full h-auto block" style={{ opacity: inverse ? 0 : 1, transition: ease }} />
              <img src={IMG.logoInverse} alt="Pawly logo, inverse" className="absolute inset-0 w-full h-auto block" style={{ opacity: inverse ? 1 : 0, transition: ease, transform: 'translateY(-0.66%)' }} /> {/* the inverse artwork sits 3 px (of 454) lower in its file than the primary one; this lines the two up exactly */}
            </>
          ) : (
            <img src={v.src} alt={`Pawly logo, ${v.label}`} className="h-full w-auto block" />
          )}
          {guides && <LogoGuides wordmark={wordmark} onDark={false} />}
        </div>
        <button type="button" onClick={() => setGuides((g) => !g)} aria-pressed={guides} aria-label={guides ? 'Hide guidelines' : 'Show guidelines'} title={guides ? 'Hide guidelines' : 'Show guidelines'}
          className={`absolute left-3 bottom-3 w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${guides ? 'bg-cobalt text-white border-cobalt' : 'bg-paper/80 border-black/15 hover:border-cobalt hover:text-cobalt'}`}>
          <Ruler size={16} />
        </button>
      </div>
      {/* Primary  [switch]  Inverse: the same toggle as the Sketch / Satellite one on the market map */}
      <div className="flex items-center gap-3 pt-4 font-sans text-[11px]">
        <button type="button" onClick={() => setVer('primary')} className={`transition-colors cursor-pointer ${!inverse ? 'text-cobalt' : 'opacity-60 hover:opacity-100'}`}>Primary</button>
        <button type="button" role="switch" aria-checked={inverse} aria-label="Inverse logo" onClick={() => setVer(inverse ? 'primary' : 'inverse')}
          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${inverse ? 'bg-cobalt' : 'bg-black/20'}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${inverse ? 'translate-x-5' : ''}`} />
        </button>
        <button type="button" onClick={() => setVer('inverse')} className={`transition-colors cursor-pointer ${inverse ? 'text-cobalt' : 'opacity-60 hover:opacity-100'}`}>Inverse</button>
      </div>
    </Block>
  );
};
