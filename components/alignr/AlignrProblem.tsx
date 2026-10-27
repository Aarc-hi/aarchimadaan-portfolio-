import React, { useEffect, useMemo, useState } from 'react';
import { Marked } from '../Marked';
import { Block, labelCls } from '../pawly/shared';
import { useInViewOnce } from '../research/shared';
import { Kind, Person } from './People';

const COBALT = '#2A52BE';
const GREY = 'rgba(26,26,26,0.16)';
const MID = 'rgba(42,82,190,0.45)';

// One grid of 100 tiny people: `tiers` colour them from the first person onwards, the rest stay grey.
// It builds itself once, the first time it scrolls into view: the people pop in one after another as plain grey, then the
// ones that count take their colour in order, so the numbers are counted out. After that it stays as it is.
const Crowd: React.FC<{ tiers: { n: number; color: string; key: string }[]; focus: string | null }> = ({ tiers, focus }) => {
  const people = useMemo(() => {
    const out: { color: string; key: string }[] = [];
    tiers.forEach((t) => { for (let i = 0; i < t.n; i++) out.push({ color: t.color, key: t.key }); });
    while (out.length < 100) out.push({ color: GREY, key: 'rest' });
    return out;
  }, [tiers]);
  const { ref, seen } = useInViewOnce<HTMLDivElement>(0.35);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (!seen) return;
    const t = window.setTimeout(() => setLit(true), 1300);
    return () => window.clearTimeout(t);
  }, [seen]);
  return (
    <div ref={ref} className="grid grid-cols-[repeat(20,auto)] gap-x-1.5 gap-y-3 w-fit">
      {people.map((p, i) => (
        <span key={i} className="block" style={seen ? { animation: `alPop 380ms cubic-bezier(.34,1.56,.64,1) ${i * 9}ms backwards` } : { opacity: 0 }}>
          <Person color={lit ? p.color : GREY} delay={i * 12} size={34} opacity={focus && focus !== p.key && p.key !== 'rest' ? 0.18 : 1} />
        </span>
      ))}
      <style>{`@keyframes alPop { from { opacity: 0; transform: translateY(10px) scale(.5) } }
      @media (prefers-reduced-motion: reduce) { [style*="alPop"] { animation: none !important } }`}</style>
    </div>
  );
};

const TIERS_A = [
  { key: 'desk', n: 23, color: COBALT },        // 33.3 cr of the workforce sit at a desk
  { key: 'work', n: 16, color: 'rgba(42,82,190,0.4)' },   // the rest of the 56.6 cr workforce (39 people in all)
];
const TIERS_B = [{ key: 'nine', n: 64, color: COBALT }];  // 21.3 of 33.3 cr sit for more than nine hours

const AUDIENCE: { kind: Kind; group: 'primary' | 'secondary'; label: string; n: number }[] = [
  { kind: 'adult', group: 'primary', label: 'Office workers', n: 24 },
  { kind: 'student', group: 'primary', label: 'Students', n: 18 },
  { kind: 'elder', group: 'secondary', label: 'Elderly people', n: 10 },
  { kind: 'gamer', group: 'secondary', label: 'Gamers', n: 8 },
];

export const AlignrProblem: React.FC = () => {
  const [focusA, setFocusA] = useState<string | null>(null);
  const [focusAud, setFocusAud] = useState<Kind | null>(null);

  // the audience crowd, shuffled in a fixed way so it looks like a crowd, not four blocks
  const crowd = useMemo(() => {
    const list: Kind[] = [];
    AUDIENCE.forEach((a) => { for (let i = 0; i < a.n; i++) list.push(a.kind); });
    let s = 7; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    return list;
  }, []);
  const groupOf = (k: Kind) => AUDIENCE.find((a) => a.kind === k)!.group;

  return (
    <>
      <Block id="alignr-problem" n="01" kicker="The problem" title="The problem">
        <p className="font-sans w-full text-[26px] md:text-[40px] tracking-tight leading-[1.25] mb-10">
          How might we encourage better sitting posture for desk-bound workers so that they avoid long-term back issues?
        </p>
        <p className="font-sans text-lg leading-relaxed mb-16">
          <span className="text-cobalt">Objective. </span><Marked text="Develop a **wearable device** that **alerts users when they slouch**, helping **improve posture** and prevent back pain." />
        </p>

        {/* how many people this is about: each tiny person is a slice of a crore (10 million) */}
        <div className="flex flex-wrap justify-between gap-x-16 gap-y-12 items-start">
          <div>
            <p className={`${labelCls} mb-1`}>1 PERSON = 1.44 CRORE</p>
            <p className="font-sans text-lg mb-5 min-h-[3.5rem]">The Indian workforce is <span className="text-cobalt">56.6 cr</span> of 144 cr people.</p>
            <Crowd tiers={TIERS_A} focus={focusA} />
            <div className="flex flex-col gap-1.5 mt-5 font-sans text-[11px]">
              {[{ k: 'desk', c: COBALT, t: 'Desk-bound workforce, 33.3 cr' }, { k: 'work', c: 'rgba(42,82,190,0.4)', t: 'The rest of the workforce, 23.3 cr' }].map((l) => (
                <button key={l.k} type="button" onMouseEnter={() => setFocusA(l.k)} onMouseLeave={() => setFocusA(null)} onFocus={() => setFocusA(l.k)} onBlur={() => setFocusA(null)}
                  className="flex items-center gap-2 text-left cursor-pointer hover:text-cobalt transition-colors"><span className="w-2.5 h-2.5 rounded-full" style={{ background: l.c }} />{l.t}</button>
              ))}
            </div>
          </div>
          <div>
            <p className={`${labelCls} mb-1`}>1 PERSON = 33.3 LAKH</p>
            <p className="font-sans text-lg mb-5 min-h-[3.5rem]">Of the <span className="text-cobalt">33.3 cr</span> at a desk, <span className="text-cobalt">21.3 cr</span> sit for 9+ hours.</p>
            <Crowd tiers={TIERS_B} focus={null} />
            <p className="font-sans text-[11px] mt-5 flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cobalt" />9+ hours of sitting, 21.3 cr</p>
          </div>
          <div className="font-sans text-lg leading-relaxed basis-full">
            <p><Marked text="**64%** of employees sit for **more than nine hours a day** at work, according to a survey." /></p>
            <p className="mt-4"><Marked text="Long-term sitting strains the body and causes **serious musculoskeletal problems**. Standing for long periods is just as harmful, so the answer is **switching between the two**, which keeps the body active through the day." /></p>
          </div>
        </div>
      </Block>

      <Block id="alignr-audience" n="02" kicker="Target audience" title="Target audience"
        intro="Anyone who sits for long hours is at risk. The ones who need simple, non-disruptive support the most are **office workers and students**, so they come first.">
        <div className="flex flex-col md:flex-row md:justify-between gap-12 items-start">
          <div className="flex flex-col gap-8 font-sans">
            {(['primary', 'secondary'] as const).map((g) => (
              <div key={g}>
                <p className={`${labelCls} mb-3`}>{g.toUpperCase()}</p>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE.filter((a) => a.group === g).map((a) => (
                    <button key={a.kind} type="button" onMouseEnter={() => setFocusAud(a.kind)} onMouseLeave={() => setFocusAud(null)} onFocus={() => setFocusAud(a.kind)} onBlur={() => setFocusAud(null)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] cursor-pointer transition-colors ${focusAud === a.kind ? 'border-cobalt text-cobalt' : 'border-black/15'}`}>
                      <Person kind={a.kind} color={g === 'primary' ? COBALT : MID} size={18} />{a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* 60 people, 12 across and 5 down, in the same column as the right-hand grid of numbers above (454px, ending at the right margin).
              The first and last person in every row touch the two edges, and the block is as tall as the chips beside it. */}
          <div className="w-full md:w-[454px] shrink-0 grid grid-cols-[repeat(12,14px)] justify-between gap-y-[6px]">
            {crowd.map((k, i) => {
              const primary = groupOf(k) === 'primary';
              const lit = focusAud ? focusAud === k : true;
              return <Person key={i} kind={k} size={28} color={primary ? COBALT : MID} opacity={lit ? 1 : 0.14} />;
            })}
          </div>
        </div>
      </Block>
    </>
  );
};
