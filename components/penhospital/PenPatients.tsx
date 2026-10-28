import React, { useState } from 'react';
import { PenShape, PEN_BLUE, PEN_INK } from './pens';

// The pens: three characters from the presentation, a proud casteist pen, a broken judge's pen and a socialist pen. Point at one (or
// tap it) and what it stands for, how it feels and what it says open on the right, in the same place. DRAFT: the three names are from
// the presentation; what each one stands for, feels and says is written to fit, so replace it with the words in the build.
const PATIENTS = [
  { name: 'The proud, casteist pen', stands: 'The old order, where caste, land and standing went together. A landowner’s pen, and its owner.', feeling: 'Proud, until the land that was meant for his children and grandchildren has to be handed over. Then heavy, and sad.', says: 'I have signed for this family for generations. Whose land is it, if not ours?' },
  { name: 'The broken judge’s pen', stands: 'The courts, where every claim and appeal ended up, and where an early version of the bill was struck down.', feeling: 'Torn and cracked, between the old law of property and a new law that asks for something else.', says: 'I signed the judgments that held the old order up. Now the law is changing under my nib.' },
  { name: 'The socialist pen', stands: 'The reformers, and the government of 1957 that brought in the first bill: land should belong to those who work it.', feeling: 'Determined and hopeful, sure that the page can change who owns the field.', says: 'Land to the tiller. I have written that line more times than I can count.' },
];
const COLOURS = [PEN_INK, '#6B3B1F', '#2F5D50', '#7B2D2D'];

export const PenPatients: React.FC = () => {
  const [i, setI] = useState(0);
  return (
    <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-12 md:gap-20 items-start">
      <ol className="flex flex-col">
        {PATIENTS.map((p, n) => (
          <li key={p.name}>
            <button type="button" onMouseEnter={() => setI(n)} onFocus={() => setI(n)} onClick={() => setI(n)}
              className={`w-full flex items-center gap-5 text-left min-h-[112px] py-4 border-b border-black/10 cursor-pointer transition-colors ${i === n ? 'text-cobalt' : 'hover:text-cobalt/70'}`}>
              <span className="font-display text-lg tabular-nums w-6">{n + 1}</span>
              <PenShape color={i === n ? PEN_BLUE : COLOURS[n]} className="w-28 h-auto shrink-0 transition-all duration-500" style={{ transform: i === n ? 'rotate(-6deg)' : 'rotate(0deg)' }} />
              <span className="font-sans text-lg">{p.name}</span>
            </button>
          </li>
        ))}
      </ol>

      {/* the file of the pen you are on */}
      <div className="grid">
        {PATIENTS.map((p, n) => (
          <div key={p.name} aria-hidden={i !== n} style={{ gridArea: '1 / 1', opacity: i === n ? 1 : 0, transition: 'opacity 450ms ease-in-out', pointerEvents: i === n ? 'auto' : 'none' }}>
            {[['Stands for', p.stands], ['How it feels', p.feeling], ['The pen says', p.says]].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[130px_minmax(0,1fr)] gap-x-6 items-center min-h-[112px] py-4 border-b border-black/10">
                <span className="font-sans text-[11px] tracking-wide text-cobalt">{k}</span>
                <span className="font-sans text-lg leading-snug">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
