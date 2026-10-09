import React, { forwardRef } from 'react';

export const AboutSection = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="min-h-screen w-full flex items-center justify-center px-6"
    >
      <p className="max-w-3xl text-center text-xl md:text-3xl font-sans font-light leading-snug">
        Hi, I'm Aarchi - a brand & interaction designer. I turn messy problems
        into experiences people get right away. Find me a problem worth
        solving, put my music on, and I disappear until it's done.
      </p>
    </div>
  );
});

AboutSection.displayName = 'AboutSection';
