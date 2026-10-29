import React, { forwardRef } from 'react';

export const AboutSection = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="min-h-screen w-full flex items-center justify-center px-6"
    >
      <p className="max-w-3xl text-center text-xl md:text-3xl font-sans font-light leading-snug">
        Hi, I'm Aarchi, a brand and interaction designer. I turn complex
        problems into clear, intuitive experiences, taking each project from
        the first idea to the finished product.
      </p>
    </div>
  );
});

AboutSection.displayName = 'AboutSection';
