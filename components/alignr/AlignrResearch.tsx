import React, { useEffect, useRef, useState } from 'react';
import { Marked } from '../Marked';
import { Block, labelCls } from '../pawly/shared';

// The four sitting postures, one picture each. They are laid on top of one another in the same spot; the slider brings one forward
// and lets the others fade back, and its text is shown on the right. The upright one (the green figure) is shown to begin with.
const POSTURES = [
  { img: 'posture1', t: 'Forward head posture', d: 'The head sits **in front of the shoulders** instead of directly over them. It often goes with **thoracic kyphosis**, an excessive forward rounding of the upper back.',
    rows: [['WHAT IT LOOKS LIKE', 'Chin pushed out, neck craned toward the screen or the page, and the upper back rounded under it.'],
           ['WHAT IT DOES', 'The neck and upper back muscles work harder to hold the head up. Over time that means stiffness, aching shoulders and tension headaches.'],
           ['WHAT THE DEVICE SEES', 'The upper back tips forward, so the angle at the sensor climbs past the slouch threshold.']] },
  { img: 'posture2', t: 'Rounded shoulders', d: 'The shoulders **hunch forward** and the upper back curves.',
    rows: [['WHAT IT LOOKS LIKE', 'Shoulders drawn in toward the chest, arms reaching forward to the desk, and the shoulder blades pulled apart.'],
           ['WHAT IT DOES', 'The chest tightens and the muscles between the shoulder blades are stretched and tired. Breathing gets shallower.'],
           ['WHAT THE DEVICE SEES', 'The rounding moves the upper back forward and the reading tilts, so a long hunch is caught the same way.']] },
  { img: 'posture3', t: 'Anterior pelvic tilt', d: 'The pelvis **pushes forward**, causing an **arch in the lower back**.',
    rows: [['WHAT IT LOOKS LIKE', 'Sitting on the front edge of the chair, the hips tipped forward and the lower back arched in.'],
           ['WHAT IT DOES', 'It loads the lower back and tightens the hips, and over a long day it brings a dull ache low in the spine.'],
           ['WHAT THE DEVICE SEES', 'It starts in the hips, but the upper body follows it forward, and that lean is what the sensor reads.']] },
  { img: 'posture4', t: 'Sitting upright', d: 'The head stacks over the shoulders and the hips, and the spine keeps its **natural curves**. This is the posture the device **nudges you back to**.',
    rows: [['WHAT IT LOOKS LIKE', 'Ears over shoulders, shoulders over hips, feet flat, and the back resting against the chair.'],
           ['WHAT IT DOES', 'The load is shared along the whole spine, so no one muscle has to keep working to hold you up.'],
           ['WHAT THE DEVICE SEES', 'The angle stays under the threshold, so the device stays quiet and nothing interrupts you.']] },
];
const PostureSlider: React.FC = () => {
  const [i, setI] = useState(POSTURES.length - 1);
  const track = useRef<HTMLDivElement>(null);
  // Left alone, it goes through the four postures by itself, on a loop, so it is clear that it changes. While the mouse is over it
  // (or the slider has the focus) it waits on the one you chose, and it carries on when you move away.
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold) return;
    const t = window.setTimeout(() => setI((c) => (c + 1) % POSTURES.length), 2500);
    return () => window.clearTimeout(t);
  }, [hold, i]);
  const near = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setI(Math.round(f * (POSTURES.length - 1)));
  };
  const at = (n: number) => `${(n / (POSTURES.length - 1)) * 100}%`;

  return (
    <div className="grid md:grid-cols-[minmax(0,170px)_minmax(0,1fr)] gap-10 md:gap-24 items-start"
      onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
      <div>
        {/* the pictures, all in one cell: the chosen one is solid, the others are faint */}
        <div className="grid">
          {POSTURES.map((p, n) => (
            <img key={p.img} src={`/ALIGNR/deck/${p.img}@4x.png`} alt={n === i ? p.t : ''} aria-hidden={n !== i} draggable={false}
              className="block w-full h-auto select-none" style={{ gridArea: '1 / 1', opacity: n === i ? 1 : 0.16, zIndex: n === i ? 2 : 1, transition: 'opacity 700ms cubic-bezier(.4,0,.2,1)' }} />
          ))}
        </div>

        {/* the slider, with a point for each posture. Move over it (or drag, or use the arrow keys) to change. */}
        <div className="mt-8 px-[10px]">
          <div ref={track} role="slider" tabIndex={0} aria-label="Type of posture" aria-valuemin={1} aria-valuemax={POSTURES.length} aria-valuenow={i + 1} aria-valuetext={POSTURES[i].t}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); near(e.clientX); }}
            onPointerMove={(e) => { if (e.pointerType === 'mouse' || e.buttons) near(e.clientX); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { setI((v) => Math.min(POSTURES.length - 1, v + 1)); e.preventDefault(); }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { setI((v) => Math.max(0, v - 1)); e.preventDefault(); }
            }}
            className="relative h-10 cursor-pointer touch-none select-none outline-none">
            <span aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-black/15" />
            <span aria-hidden="true" className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-cobalt" style={{ width: at(i), transition: 'width 500ms cubic-bezier(.22,1,.36,1)' }} />
            {POSTURES.map((p, n) => (
              <span key={p.img} aria-hidden="true" className={`absolute top-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500 ${n <= i ? 'bg-cobalt' : 'bg-black/25'}`} style={{ left: at(n) }} />
            ))}
            <span aria-hidden="true" className="absolute top-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cobalt border-2 border-paper shadow-[0_2px_8px_rgba(42,82,190,0.45)]" style={{ left: at(i), transition: 'left 500ms cubic-bezier(.22,1,.36,1)' }} />
          </div>
          <div className="relative h-4 mt-1 font-sans text-[11px]">
            {POSTURES.map((p, n) => (
              <span key={p.img} className={`absolute -translate-x-1/2 transition-colors ${n === i ? 'text-cobalt' : 'opacity-50'}`} style={{ left: at(n) }}>{String(n + 1).padStart(2, '0')}</span>
            ))}
          </div>
        </div>
      </div>

      {/* the words for the posture that is forward; they cross-fade in one cell so the page never jumps */}
      <div className="grid">
        {POSTURES.map((p, n) => (
          <div key={p.img} aria-hidden={n !== i} style={{ gridArea: '1 / 1', opacity: n === i ? 1 : 0, transition: 'opacity 500ms ease-in-out', pointerEvents: n === i ? 'auto' : 'none' }}>
            <p className={`${labelCls} text-cobalt mb-2 leading-none`}>{String(n + 1).padStart(2, '0')}</p>
            <p className="font-display text-3xl md:text-4xl tracking-tight leading-tight mb-6">{p.t}</p>
            <p className="font-sans text-lg leading-relaxed"><Marked text={p.d} /></p>
            <div className="mt-6">
              {p.rows.map(([k, v]) => (
                <div key={k} className="grid sm:grid-cols-[180px_minmax(0,1fr)] gap-x-8 gap-y-1 py-3 border-t border-black/10">
                  <p className={`${labelCls} text-cobalt pt-1`}>{k}</p>
                  <p className="font-sans text-[15px] leading-relaxed">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AlignrResearch: React.FC = () => (
  <Block id="alignr-research" n="03" kicker="Types of slouching" title="Types of slouching">
    <p className="font-sans text-lg leading-relaxed mb-12">
      <Marked text="Bad posture causes **muscle imbalances**, **stiffness and pain**, **headaches**, and problems that reach your **breathing and digestion**." />
    </p>
    <PostureSlider />
  </Block>
);

const INSIGHT = {
  title: 'Posture is not ignored, it’s unnoticed.',
  text: 'Nobody decides to slouch. After hours of sitting, with attention on the screen or the page, the body drifts **without being noticed**. So the problem is not **a lack of willpower**, it is **a lack of awareness**, and a **small, well-timed nudge** is enough to bring it back.',
};

export const AlignrInsights: React.FC = () => (
  <Block id="alignr-insights" n="04" kicker="Insights" title="Insights">
    {/* the insight is set the same size as the problem statement above */}
    <p className="font-sans w-full text-[26px] md:text-[40px] tracking-tight leading-[1.25] mb-10">{INSIGHT.title}</p>
    <p className="font-sans text-lg leading-relaxed"><Marked text={INSIGHT.text} /></p>
  </Block>
);