import React from 'react';
import { PERSONAS } from './thelaData';
import { Chapter, labelCls } from './shared';

export const PersonaCards: React.FC = () => (
  <Chapter id="ch-personas" n="03" kicker="Personas" title="Persona"
    intro="Five people from the market. The stakeholder map in the next chapter shows where each person sits.">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:w-4/5">
      {PERSONAS.map((p) => (
        <div key={p.id} className="relative aspect-[4/5] rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 p-3 flex items-center justify-center">
            <img src={p.img} alt={`${p.name}, ${p.role}`} className="max-h-full max-w-full object-contain" draggable={false} />
          </div>
          <div className="px-4 pb-4">
            <p className="font-display text-lg tracking-tight leading-none">{p.name}</p>
            <p className={`${labelCls} pt-1.5`}>{p.role}</p>
          </div>
        </div>
      ))}
    </div>
  </Chapter>
);
