import React, { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '../research/shared';
import { Person } from '../alignr/People';

// How the Land Reform Act worked, in acres. Every little square is one acre.
//  1. A landowner holds 100 acres.
//  2. The Act sets a ceiling, and a large family may keep 20 acres at most: the squares inside the dashed box stay.
//  3. The other 80 acres are surrendered, and vest in the government.
//  4. The Land Board gives that land out, and no one could be given more than ONE acre (section 96), so 80 acres is shared among 80 people.
// When the land is surrendered, what the owner is PAID shows under him: about ₹1.28 lakh for 80 acres of coconut garden (₹2,000 an acre = ₹1.6 lakh,
// scaled down by the 1971 amendment: 100% of the first ₹1 lakh, 50% of the next ₹50,000, 25% of the rest), against the most the law allowed, ₹2 lakh.
// It plays once, the first time it scrolls into view; the four numbers below it jump to any step.
// The 100 acres is an example. The ceilings and the one-acre limit are from the Kerala Land Reforms Act (sections 82 and 96).
const INK = '#1A1A1A';
const BLUE = '#2A52BE';
const SLATE = '#AFAEA7';

const COLS = 20, ROWS = 5;             // the landowner's 100 acres
const KEEP_COLS = 5, KEEP_ROWS = 4;    // the 20 acres he may keep
const PAID = 1.28, CAP = 2;             // lakh rupees: what he is paid, and the most the law allowed
const FAMILIES = 80;                    // 80 acres, and at most one acre each: 80 people

type Pt = { x: number; y: number };
const own = (i: number): Pt => ({ x: 14 + (i % COLS) * 14, y: 130 + Math.floor(i / COLS) * 14 });
const isKept = (i: number) => (i % COLS) < KEEP_COLS && Math.floor(i / COLS) < KEEP_ROWS;
// the 80 that leave, numbered in the order they leave
const SURPLUS: number[] = Array.from({ length: COLS * ROWS }, (_, i) => i).filter((i) => !isKept(i));
const gov = (j: number): Pt => ({ x: 352 + (j % 16) * 14, y: 130 + Math.floor(j / 16) * 14 });
const fam = (j: number): Pt => {
  return { x: 652 + (j % 20) * 15, y: 172 + Math.floor(j / 20) * 34 };
};

const STEPS = [
  'A landowner holds 100 acres of land.',
  'The Act puts a ceiling on how much one family may keep: for a large family, 20 acres at most.',
  'The rest, 80 acres, has to be given up. It passes to the government, and the owner is paid for it, but at fixed rates and never more than ₹2 lakh.',
  'The Land Board gives the land out in tiny plots, no more than one acre to a person, so 80 acres reaches 80 people.',
];

export const LandCeiling: React.FC = () => {
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.4);
  const [step, setStep] = useState(0);
  const auto = useRef(true);                      // the first run plays by itself, until you choose a step
  const timers = useRef<number[]>([]);

  const play = (from: number) => {
    timers.current.forEach((t) => window.clearTimeout(t)); timers.current = [];
    setStep(from);
    const wait = [1500, 2300, 2700];
    let at = 0;
    for (let s = from + 1; s < STEPS.length; s++) { at += wait[s - 1]; timers.current.push(window.setTimeout(() => { if (auto.current) setStep(s); }, at)); }
    // when it has finished it rests a moment, then plays again, until you pick a step yourself
    timers.current.push(window.setTimeout(() => { if (auto.current) play(0); }, at + 5000));
  };
  useEffect(() => { if (seen && auto.current) play(0); return () => timers.current.forEach((t) => window.clearTimeout(t)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [seen]);

  const choose = (s: number) => { auto.current = false; timers.current.forEach((t) => window.clearTimeout(t)); setStep(s); };

  const ownerAcres = step < 2 ? 100 : 20;
  const govAcres = step === 2 ? 80 : 0;
  const famAcres = step === 3 ? 80 : 0;
  const posOf = (i: number, j: number): Pt => (isKept(i) ? own(i) : step <= 1 ? own(i) : step === 2 ? gov(j) : fam(j));

  return (
    <div ref={ref}>
      <svg viewBox="0 0 980 300" className="block w-full h-auto" role="img" aria-label={STEPS[step]}>
        {/* the three places */}
        <g className="font-sans" fontSize="12" fill={INK}>
          <text x="14" y="84">The landowner</text>
          <text x="352" y="84">The government</text>
          <text x="650" y="84">Landless families</text>
        </g>
        <g className="font-sans" fontSize="12" fill={BLUE}>
          <text x="14" y="104" style={{ transition: 'opacity 300ms' }}>{ownerAcres} acres</text>
          <text x="352" y="104" style={{ opacity: govAcres ? 1 : 0.35, transition: 'opacity 500ms' }}>{govAcres} acres</text>
          <text x="650" y="104" style={{ opacity: famAcres ? 1 : 0.35, transition: 'opacity 500ms' }}>{famAcres ? `${FAMILIES} people, an acre each` : '0 acres'}</text>
        </g>

        {/* the ceiling: the 20 acres he may keep */}
        <rect x="9" y="125" width={KEEP_COLS * 14 + 4} height={KEEP_ROWS * 14 + 4} fill="none" stroke={BLUE} strokeWidth="1.4" strokeDasharray="4 3" rx="2"
          style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 500ms' }} />
        <text x="14" y="214" fontSize="11" fill={BLUE} className="font-sans" style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 500ms' }}>the ceiling: 20 acres</text>

        {/* what the owner is paid for the 80 acres he gave up */}
        <g style={{ opacity: step >= 2 ? 1 : 0, transition: 'opacity 600ms ease 300ms' }}>
          <text x="14" y="262" fontSize="11" fill={INK} className="font-sans">Paid to the owner: about ₹{PAID} lakh</text>
          <rect x="14" y="270" width="280" height="5" rx="2.5" fill="rgba(26,26,26,0.18)" style={{ transform: 'none' }} />
          <rect x="14" y="270" width={step >= 2 ? (280 * PAID) / CAP : 0} height="5" rx="2.5" fill={BLUE} style={{ transform: 'none', transition: 'width 1400ms cubic-bezier(0.32,0.72,0,1) 500ms' }} />
          <text x="294" y="290" fontSize="11" fill={INK} textAnchor="end" className="font-sans">the most the law allowed: ₹{CAP} lakh</text>
        </g>

        {/* the families, who appear when the land reaches them */}
        {Array.from({ length: FAMILIES }, (_, p) => (
          <g key={p} transform={`translate(${652 + (p % 20) * 15} ${152 + Math.floor(p / 20) * 34})`} style={{ opacity: step === 3 ? 1 : 0, transition: `opacity 500ms ease ${step === 3 ? 500 + p * 6 : 0}ms` }}>
            <Person color={INK} size={16} />
          </g>
        ))}

        {/* the acres: one square each */}
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const j = isKept(i) ? 0 : SURPLUS.indexOf(i);
          const q = posOf(i, j);
          const size = !isKept(i) && step === 3 ? 8 : 12;
          const leaving = !isKept(i) && step >= 2;
          return (
            <rect key={i} width={size} height={size} rx="1.5" x={0} y={0}
              fill={isKept(i) ? INK : step >= 1 ? BLUE : INK}
              style={{ transform: `translate(${q.x}px, ${q.y}px)`, transition: `transform 1000ms cubic-bezier(0.32,0.72,0,1) ${leaving ? (j % 60) * 9 : 0}ms, fill 600ms ease, width 600ms ease, height 600ms ease` }} />
          );
        })}
      </svg>

      {/* what is happening, and four steps to go to */}
      <div className="grid mt-6 min-h-[3.4em]">
        {STEPS.map((t, s) => (
          <p key={s} aria-hidden={step !== s} className="font-sans text-lg leading-relaxed" style={{ gridArea: '1 / 1', opacity: step === s ? 1 : 0, transition: 'opacity 450ms ease-in-out' }}>{t}</p>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4">
        {STEPS.map((_, s) => (
          <button key={s} type="button" onClick={() => choose(s)} aria-label={`Step ${s + 1}`} aria-pressed={step === s}
            className={`w-8 h-8 rounded-full border font-sans text-[11px] cursor-pointer transition-colors ${step === s ? 'bg-cobalt border-cobalt text-white' : 'border-black/20 hover:border-cobalt hover:text-cobalt'}`}>{s + 1}</button>
        ))}
        <button type="button" onClick={() => { auto.current = true; play(0); }} className="ml-2 font-sans text-[11px] tracking-wide underline underline-offset-4 cursor-pointer hover:text-cobalt">Play again</button>
      </div>
      <p className="font-sans text-[11px] tracking-wide mt-6" style={{ color: SLATE }}>One square is one acre. The 100 acres is an example. The ceiling of 20 acres is the highest the Act allowed, for a large family.</p>
    </div>
  );
};
