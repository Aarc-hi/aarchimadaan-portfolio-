import React, { useEffect, useState } from 'react';
import { PenShape, PEN_BLUE } from './pens';

// The Land Reform in Kerala, as five stops on a line. A small pen travels to the stop you point at (or tap), and the words
// for that stop fade in below, in the same place. Dates and facts are from the sources listed under the section.
const STAGES = [
  { year: '1957', title: 'The first bill', text: 'Kerala’s first elected government brings in the Agrarian Relations Bill: tenants cannot be thrown off their land, rents are made fair, and there will be a limit on how much land one family may hold. The government is dismissed in 1959, and a later version of the bill is struck down by the High Court.' },
  { year: '1963–64', title: 'The Land Reforms Act', text: 'The Kerala Land Reforms Act becomes law at the end of 1963 and comes into force in 1964. It sets up the machinery: fair rents, and a ceiling on the land one family may keep.' },
  { year: '1970', title: 'Tenancy ends', text: 'The 1969 amendment comes into force on 1 January 1970. Landlordism ends: tenants who farmed the land become its owners, and families who lived in huts on someone else’s land are given the ground under their homes.' },
  { year: 'After 1970', title: 'It goes on', text: 'The change does not happen in a day. Land tribunals and land boards settle each claim paper by paper, appeals reach the courts, and land above the ceiling is taken over and given to landless families, slowly, over many years.' },
  { year: 'The pen', title: 'Every change was signed', text: 'Each claim, deed and transfer had to be written out and signed by hand. The pens of the landowner who lost land and of the families who gained it end up on the repair bench, and each one carries what its owner felt.' },
];

export const LandTimeline: React.FC = () => {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);            // while you are pointing at it, it waits for you
  // left to itself the pen travels along the line, stop by stop, and starts again from 1957 at the end
  useEffect(() => {
    if (hold) return;
    const t = window.setInterval(() => setI((c) => (c + 1) % STAGES.length), 5500);
    return () => window.clearInterval(t);
  }, [hold, i]);
  const at = (n: number) => `${(n / (STAGES.length - 1)) * 100}%`;
  return (
    <div onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
      <div className="relative px-16">
        <div className="relative h-28">
          {/* the line, and a blue part of it up to the stop you are on */}
          <span aria-hidden="true" className="absolute left-0 right-0 top-10 h-[2px] rounded-full bg-black/15" />
          <span aria-hidden="true" className="absolute left-0 top-10 h-[2px] rounded-full bg-cobalt" style={{ width: at(i), transition: 'width 600ms cubic-bezier(.22,1,.36,1)' }} />
          {STAGES.map((s, n) => (
            <button key={s.year} type="button" onMouseEnter={() => setI(n)} onFocus={() => setI(n)} onClick={() => setI(n)}
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer outline-none" style={{ left: at(n) }} aria-pressed={i === n}>
              <span className={`font-display text-lg tracking-tight leading-none whitespace-nowrap transition-colors duration-500 ${i === n ? 'text-cobalt' : 'text-ink/50'}`}>{s.year}</span>
              <span className={`mt-[26px] w-3 h-3 rounded-full border-2 border-paper transition-colors duration-500 ${n <= i ? 'bg-cobalt' : 'bg-black/25'}`} />
            </button>
          ))}
          {/* the pen, riding along the line */}
          <PenShape color={PEN_BLUE} className="absolute w-24 h-auto -translate-x-1/2 pointer-events-none" style={{ left: at(i), top: 56, transition: 'left 600ms cubic-bezier(.22,1,.36,1)' }} />
        </div>
      </div>

      {/* the words for each stop, one on top of the other so the page never jumps */}
      <div className="grid mt-8">
        {STAGES.map((s, n) => (
          <div key={s.year} aria-hidden={i !== n} style={{ gridArea: '1 / 1', opacity: i === n ? 1 : 0, transition: 'opacity 500ms ease-in-out', pointerEvents: i === n ? 'auto' : 'none' }}>
            <p className="font-sans text-lg text-cobalt mb-3">{s.title}</p>
            <p className="font-sans text-lg leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
