import React from 'react';
import { Marked } from '../Marked';
import { Block } from '../pawly/shared';
import { WaitDemo } from './WaitDemo';

export const AlignrHow: React.FC = () => (
  <Block id="alignr-how" n="05" kicker="How it works" title="How it works"
    intro="A sensor on the upper back reads **how far the body leans**. When the lean passes a set angle and stays there, **the device speaks up**.">
    <div className="mb-20 md:mb-28">
      <div className="font-sans text-lg leading-relaxed space-y-5">
        <p>The posture indicator uses an <span className="text-cobalt font-bold">MPU6050</span> sensor connected to a microcontroller to detect upper body movement along the X-axis.</p>
        <p>When the user slouches, the sensor registers a <span className="text-cobalt font-bold">change in angle</span>. We set threshold values and a time delay of 6 seconds, to filter out temporary movements like bending to pick something up.</p>
        <p>If poor posture is held for more than <span className="text-cobalt font-bold">6 seconds</span>, the device makes a noise, prompting the user to sit straight.</p>
      </div>
    </div>

    <p className="font-sans text-lg text-cobalt mb-2">Watch it decide</p>
    <p className="font-sans text-lg leading-relaxed mb-10"><Marked text="A quick bend never reaches **six seconds**. A real slouch does." /></p>
    <WaitDemo />
  </Block>
);
