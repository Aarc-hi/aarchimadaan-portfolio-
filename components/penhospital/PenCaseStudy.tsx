import React from 'react';
import { Block } from '../pawly/shared';
import { Marked } from '../Marked';
import { PROJECTS } from '../../data';
import { LandTimeline } from './LandTimeline';
import { LandCeiling } from './LandCeiling';
import { PenPatients } from './PenPatients';
import { PenRepair } from './PenRepair';

// The sections of The Pen Hospital page, in order. The ids drive the side nav in ProjectDetailView.
// The video walkthrough comes after the first five, and the reflection after the video.
export const PEN_NAV_A = [
  { id: 'pen-shop', label: 'The shop' },
  { id: 'pen-history', label: 'The history' },
  { id: 'ch-pen-ceiling', label: 'How the Act worked', sub: true },
  { id: 'pen-idea', label: 'The idea' },
  { id: 'pen-world', label: 'Building the world' },
  { id: 'pen-interaction', label: 'The interaction' },
];

const project = () => PROJECTS.find((p) => p.id === 'p5')!;

// what is in the room, read from the models in the Unity project

const SRC = 'font-sans text-[11px] tracking-wide mt-10 opacity-70';

// the rules of the Land Reforms Act (as amended), in the order they happened to the land: what a family could keep, what then
// happened to the rest, who was paid, and who received it
const RULES: [string, string][] = [
  ['What a family could keep', 'A single adult: **5 standard acres** (6 to 7.5 acres). A family of two to five: **10 standard acres** (12 to 15 acres). A larger family: 10 standard acres and one more for each member over five (12 to **20 acres**).'],
  ['What happened to the rest', 'From a date set by the government, no one could hold more than the ceiling. The owner had to file a statement within **three months**, and a **Taluk Land Board** decided exactly which land was given up. It then passed to the government, free of all claims.'],
  ['What the owner was paid', 'Not the market price, but a **fixed rate per acre** for the kind of land, scaled down, and **never more than ₹2 lakh**. The animation shows an example.'],
  ['Who received it', 'First the **families who lived in huts** on that land. After them, **landless farm workers** (half of that share for workers from the Scheduled Castes, Scheduled Tribes and other backward classes) and small holders. **No one could be given more than one acre**, and they paid for it in up to 16 yearly instalments.'],
];
const A = 'underline underline-offset-4 hover:text-cobalt';

export const PenCaseStudy: React.FC = () => {
  const p = project();
  return (
    <>
      <Block id="pen-shop" n="01" kicker="The shop" title="The shop">
        <p className="font-sans text-lg leading-relaxed mb-5"><Marked text="The Pen Hospital is a **real pen repair shop in Thrissur, Kerala**, on Town Hall Road, near the Round. People bring in their **fountain pens** to be mended, and it is still working today." /></p>
        <p className="font-sans text-lg leading-relaxed"><Marked text="It was started by **Kaalathodu Koluthu Parambil Abdulla**, a fountain pen mechanic who came back to Kerala from Bengal, and it moved to its present place in **1959**. It is now run by his son, **Nazar**, who learnt the craft from his father." /></p>
      </Block>

      <Block id="pen-history" n="02" kicker="The history" title="The history"
        intro="The project is set in the **1960s**, when the shop had settled in its present place, and the **Land Reform Act** was changing who owned the land in Kerala. Move along the line.">
        <LandTimeline />
        <div id="ch-pen-ceiling" className="scroll-mt-32 mt-24">
          <p className="font-sans text-lg text-cobalt mb-2">How the Act worked, in acres</p>
          <p className="font-sans text-lg leading-relaxed mb-10"><Marked text="The heart of the Act was a **ceiling**. No family could keep more than a set amount of land, and whatever was **over it** was taken, and given to those who had none." /></p>
          <LandCeiling />
          <div className="mt-16">
            <p className="font-sans text-lg text-cobalt mb-6">The rules, from the Act</p>
            {RULES.map(([k, v]) => (
              <div key={k} className="grid md:grid-cols-[200px_minmax(0,1fr)] gap-x-10 gap-y-1 py-4 border-t border-black/10">
                <p className="font-sans text-[11px] tracking-wide text-cobalt pt-1.5">{k}</p>
                <p className="font-sans text-lg leading-relaxed"><Marked text={v} /></p>
              </div>
            ))}
          </div>
        </div>
      </Block>

      <Block id="pen-idea" n="03" kicker="The idea" title="The idea">
        <p className="font-sans w-full text-[26px] md:text-[40px] tracking-tight leading-[1.25] mb-10"><Marked text={p.problemStatement || ''} /></p>
        <p className="font-sans text-lg leading-relaxed mb-5"><Marked text="The Land Reform Act is usually told in dates and acres. This project tells it through **pens**. In 1960s Kerala a pen could decide who you were and what you owned, so here the pens become **characters**, each with a personality shaped by the **socio-political history** of the time. Each carries an **ideology** and a moment from the Land Reform, and what its owner felt: a landowner who lost the land meant for his children, a judge between the old law and the new, a reformer who believed the land belonged to those who work it." /></p>
        <p className="font-sans text-lg leading-relaxed mb-14"><Marked text={p.concept} /></p>
        <p className="font-sans text-lg text-cobalt mb-2">Meet the pens</p>
        <p className="font-sans text-lg leading-relaxed mb-8">Three pens have come in to the shop. Point at one to see what it stands for, and hear what it has to say.</p>
        <PenPatients />
      </Block>

      <Block id="pen-world" n="04" kicker="Building the world" title="Building the world">
        <p className="font-sans text-lg leading-relaxed mb-5"><Marked text="**Everything** in the experience, down to the room itself, was **modelled in Blender** by us, with every small detail. The textures were made in Blender and exported to **Unity**, where the lighting was added." /></p>
        <p className="font-sans text-lg leading-relaxed mb-8"><Marked text="The room is meant to feel like the shop did then. The **radio**, the **tap**, the **drawers** and everything else were picked to carry the essence of that time." /></p>
        <p className="font-sans text-lg text-cobalt mb-4">In Blender</p>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-14">
          {[['lamp', 'The kerosene lamp'], ['papers', 'The paper stack'], ['glass', 'The magnifying glass'], ['pen-uv', 'The fountain pen, unwrapped'], ['drawers', 'The drawers'], ['pen-parts', 'The fountain pen, in parts']].map(([f, a]) => (
            <img key={f} src={`/penhospital/world/blender-${f}.webp`} alt={`${a}, in Blender`} className="w-full block" loading="lazy" />
          ))}
        </div>
        <p className="font-sans text-lg text-cobalt mb-4">In Unity</p>
        <div className="grid gap-4 md:grid-cols-2 mb-14">
          <img src="/penhospital/world/unity-sink.webp" alt="The sink and the three-tier stand, in Unity" className="w-full block" loading="lazy" />
          <img src="/penhospital/world/unity-cupboard.webp" alt="The cupboard and the radio, in Unity" className="w-full block" loading="lazy" />
        </div>
        <p className="font-sans text-lg text-cobalt mb-4">The finished room</p>
        <div className="grid gap-4 md:grid-cols-2">
          <img src="/penhospital/world/room.webp" alt="The pen repair shop in Unity, with the desk, the sink and the window" className="w-full md:col-span-2 block" loading="lazy" />
          <img src="/penhospital/world/desk.webp" alt="The workbench, with the fan, the pen and the sink" className="w-full block" loading="lazy" />
          <img src="/penhospital/world/shelves.webp" alt="The other side of the shop, with the drawers, the cupboard and the radio" className="w-full block" loading="lazy" />
        </div>
      </Block>

      <Block id="pen-interaction" n="05" kicker="The interaction" title="The interaction">
        <p className="font-sans text-lg leading-relaxed mb-8"><Marked text="The player is the **pen doctor**, the owner of the shop. They pick up a pen and **repair it**, and when it is mended the pen **speaks up** and tells the story of its owner, as you can hear in the walkthrough. Here is the same idea on the page." /></p>
        <PenRepair />
      </Block>
    </>
  );
};
