import React from 'react';
import { Marked } from '../Marked';
import { Block, labelCls } from '../pawly/shared';
import { BackSketch } from './BackSketch';
import type { Wear } from './BackSketch';

const IDEAS: { name: string; img: string; wear: Wear; final?: boolean; pros: string[]; cons: string[] }[] = [
  { name: 'Neckband', img: 'neckband', wear: 'neckband',
    pros: ['Built-in support structure', 'Posture correction without bulk', 'Hands-free and easy to wear'],
    cons: ['Can cause neck discomfort', 'May shift with excessive neck movement'] },
  { name: 'Strap-on belt', img: 'strap', wear: 'belt',
    pros: ['Secure and adjustable fit', 'Reusable and durable', 'Stable sensor placement'],
    cons: ['Slightly bulky', 'Takes time to wear', 'May feel restrictive'] },
  { name: 'Stick-on adhesive device', img: 'final-product', wear: 'final', final: true,
    pros: ['Lightweight and discreet', 'No app, no setup', 'Silicone adhesive holds it in place'],
    cons: ['Could be more compact', 'Needs design and functionality refinement'] },
];

// a table: a row for each way of wearing it, with the sketch, its name, and what worked and what did not
const COLS = 'md:grid-cols-[164px_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.2fr)] md:gap-x-12';

export const AlignrBuild: React.FC = () => (
  <Block id="alignr-building" n="06" kicker="Building it" title="Building it">
    <div role="table" aria-label="Ways of wearing the sensor">
      <div role="row" className={`hidden md:grid ${COLS} pb-4 border-b border-black/10 font-sans text-[11px] tracking-wide`}>
        <span role="columnheader" />
        <span role="columnheader">Idea</span>
        <span role="columnheader" className="text-cobalt">What worked</span>
        <span role="columnheader">What did not</span>
      </div>
      {IDEAS.map((idea, n) => (
        <div key={idea.name} role="row" className={`grid ${COLS} gap-y-6 items-start py-10 border-b border-black/10`}>
          <div role="cell">
            <BackSketch wear={idea.wear} label={`Sketch of a person from the back with the ${idea.name.toLowerCase()}`} className="block w-[124px] h-auto" />
          </div>
          <div role="cell" className="font-sans text-lg">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 items-baseline">
              <span className="font-display tabular-nums text-cobalt leading-snug">{n + 1}</span>
              <span className="text-ink font-bold leading-snug">{idea.name}</span>
              {idea.final && (<><span /><span className="font-sans text-[11px] tracking-wide text-cobalt mt-2">Final idea</span></>)}
            </div>
          </div>
          <div role="cell">
            <p className="md:hidden font-sans text-[11px] tracking-wide text-cobalt mb-3">What worked</p>
            <ul className="space-y-3">{idea.pros.map((p) => <li key={p} className="font-sans text-lg leading-snug">{p}</li>)}</ul>
          </div>
          <div role="cell">
            <p className="md:hidden font-sans text-[11px] tracking-wide mb-3">What did not</p>
            <ul className="space-y-3 opacity-80">{idea.cons.map((p) => <li key={p} className="font-sans text-lg leading-snug">{p}</li>)}</ul>
          </div>
        </div>
      ))}
    </div>
    <p className="font-sans text-lg leading-relaxed mt-10">
      <Marked text="The final device is a small piece that sits on the **upper back** on a **silicone adhesive**: lighter than a band, and with nothing to put on over the clothes." />
    </p>
  </Block>
);
export const AlignrExplorations: React.FC = () => (
  <Block id="alignr-explorations" n="07" kicker="Form" title="Form">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {[1, 2, 3, 4, 5, 6].map((n) => <img key={n} src={`/ALIGNR/deck/final0${n}.jpg`} alt={`The final device, view ${n}`} className="block w-full h-auto" />)}
    </div>
  </Block>
);
const FEEDBACK = [
  'Could be more compact',
  'Use a stretch sensor',
  'Needs design and functionality refinement',
  'Commercially viable with app integration',
  'Offer vibration feedback instead of sound',
  'Design for discreet, low-profile wear',
  'Let users choose the feedback type',
  'Explore a patch-based design for comfort',
];

export const AlignrTesting: React.FC = () => (
  <Block id="alignr-testing" n="08" kicker="Testing" title="Testing"
    intro="The prototype was **worn and tried by people** while we watched. This is **what they told us**.">
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-20 items-stretch">
      {/* the photos fill the same height as the list, so their top and bottom edges line up with its first and last lines */}
      {/* the photos are laid inside this box, so the height comes from the list alone: the box (and so the photos) runs from the first line of the list to the last */}
      <div className="relative h-[340px] lg:h-auto">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-3">
          {[1, 2, 3, 4].map((n) => <img key={n} src={`/ALIGNR/deck/test${n}.jpg`} alt={`A person trying the prototype, photo ${n}`} className="block w-full h-full min-h-0 object-cover" />)}
        </div>
      </div>
      <ol className="flex flex-col border-t border-cobalt/25">
        {FEEDBACK.map((f, n) => (
          <li key={f} className="flex items-baseline gap-5 py-3.5 border-b border-cobalt/25">
            <span className="font-display text-lg tabular-nums text-cobalt w-6">{n + 1}</span>
            <span className="font-sans text-lg leading-snug">{f}</span>
          </li>
        ))}
      </ol>
    </div>
  </Block>
);
