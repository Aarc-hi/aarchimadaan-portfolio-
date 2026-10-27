import React from 'react';
import { Marked } from '../Marked';

export const tile = 'bg-paper rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.08)]';
export const labelCls = 'font-sans text-[11px] tracking-wide';

export const pill = (on: boolean) =>
  `px-4 py-2 rounded-full font-sans text-[11px] tracking-wide border transition-colors cursor-pointer ${on ? 'bg-cobalt text-white border-cobalt' : 'border-black/15 hover:border-cobalt hover:text-cobalt'}`;

// A numbered section of the case study. It is a <section id> so the side nav can follow it.
export const Block: React.FC<{ id: string; n: string; kicker: string; title: string; intro?: string; children: React.ReactNode }> = ({ id, n, kicker, title, intro, children }) => (
  <section id={id} className="scroll-mt-32 mb-28 md:mb-36">
    <h2 className="font-display font-normal text-lg tracking-wide leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">{title}</h2>
    {intro && <p className="font-sans text-lg mb-10 leading-relaxed"><Marked text={intro} /></p>}
    {children}
  </section>
);

export type Box = { l: number; t: number; w: number; h: number };
export const boxStyle = (b: Box): React.CSSProperties => ({ left: `${b.l}%`, top: `${b.t}%`, width: `${b.w}%`, height: `${b.h}%` });

