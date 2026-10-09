import React, { forwardRef } from 'react';

const LOGOTYPE = '/aarchi-logotype.svg';

const LINKS: [string, string][] = [
  ['LinkedIn', 'https://linkedin.com/in/aarchi-madaan-4634a32b5/'],
  ['Instagram', 'https://www.instagram.com/sosillybilli.design/'],
  ['Behance', 'https://behance.net/aarchimadaan'],
];

// The last stop on the home page. The Selected Works strip hands over to it with one more scroll.
// When the page lands here the mascot hops onto the dot of the "i" (see MascotHero: [data-footer-logo]).
export const HomeFooter = forwardRef<HTMLElement>((_props, ref) => (
  <footer
    ref={ref}
    // Breaks out of the content column like the strip above it. -mb-32 cancels the page's bottom
    // padding so the page ends exactly at the foot of this block.
    className="relative w-screen left-1/2 -translate-x-1/2 -mb-32 min-h-[72vh] flex flex-col justify-end px-4 md:px-12 pt-6 md:pt-8 pb-6 md:pb-10 bg-paper"
  >
    {/* Full width on purpose: the logotype sits in the bottom-left corner and the button in the bottom-right,
        on any screen size (not inside the 1280px content column). */}
    <div className="w-full flex items-end justify-between gap-6">
      {/* The logotype, bottom left. Drawn from the SVG as a mask so it takes the page's ink colour (and cobalt on hover) */}
      <div
        data-footer-logo
        role="img"
        aria-label="Aarchi"
        className="shrink-0 bg-ink hover:bg-cobalt transition-colors duration-500"
        style={{
          width: 'clamp(260px, 46vw, 680px)',
          aspectRatio: '661 / 129', // the logotype file, trimmed to the lettering
          WebkitMaskImage: `url(${LOGOTYPE})`,
          maskImage: `url(${LOGOTYPE})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'left bottom',
          maskPosition: 'left bottom',
        }}
      />

      {/* bottom-right: the three social links, then back to top underneath them */}
      <div className="flex flex-col items-end gap-5 pb-1 font-sans text-[11px] md:text-xs uppercase tracking-wide whitespace-nowrap">
        <div className="flex flex-col items-end gap-2">
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="group relative hover:text-cobalt transition-colors">
              {label}
              <span className="absolute left-0 -bottom-0.5 h-px w-full bg-current scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="hover:text-cobalt transition-colors cursor-pointer uppercase tracking-wide"
        >
          Back to top ↑
        </button>
      </div>
    </div>
  </footer>
));

HomeFooter.displayName = 'HomeFooter';
