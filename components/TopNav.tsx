import React from 'react';
import { ViewState, NAV_ITEMS } from '../types';
import { useNavVisibility } from './useNavVisibility';
import { SoundToggle } from './SoundToggle';

interface TopNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  // Always hidden, overriding the normal scroll-based logic.
  forceHidden?: boolean;
  // True from the Selected Works strip down: the nav stays visible even after scrolling down.
  forceShown?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({ currentView, setView, forceHidden, forceShown }) => {
  const activeId = currentView === 'project-detail' ? 'PROJECTS' : currentView;
  const scrollHidden = useNavVisibility();
  const hidden = forceHidden || (scrollHidden && !forceShown);

  return (
    <nav
      className={`pointer-events-none fixed top-0 left-0 w-full z-40 pt-[34px] md:pt-[54px] pb-3 pl-[84px] pr-[6.25vh] flex justify-end gap-5 md:gap-16 font-sans text-sm transition-transform duration-300 ease-out ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* The "aarchi" logotype, just after the mascot in the top-left (the mascot's art ends about 112px in).
          Drawn as a mask so it takes the ink colour, and cobalt on hover. Hidden on phones, where the links need the room. */}
      <button
        type="button"
        aria-label="Aarchi — home"
        onClick={() => { setView('HOME'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="pointer-events-auto hidden md:block absolute top-[54px] h-[20px] cursor-pointer bg-ink hover:bg-cobalt transition-colors duration-300"
        style={{
          // --mascot-corner is set every frame by MascotHero: 0 while the mascot is elsewhere, 1 once it sits in the
          // corner. With no mascot in the corner the logotype takes the top-left; as the mascot arrives it is pushed right.
          left: 'calc(32px + 96px * var(--mascot-corner, 1))',
          aspectRatio: '661 / 129', // the logotype file, trimmed to the lettering
          WebkitMaskImage: 'url(/aarchi-logotype.svg)',
          maskImage: 'url(/aarchi-logotype.svg)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'left center',
          maskPosition: 'left center',
        }}
      />
      <SoundToggle />
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`pointer-events-auto cursor-pointer hover:text-cobalt ${activeId === item.id ? 'text-cobalt' : ''}`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};
