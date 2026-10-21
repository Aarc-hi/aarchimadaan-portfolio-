import React from 'react';
import { ColourPalette, FontsUsed, LogoSection, WhatIsPawly } from './PawlyBrand';
import { BenefitIcons, Decisions, Dieline, FoldIt } from './PawlyPack';

// The sections of the Pawly page, in order. The ids drive the side nav in ProjectDetailView.
export const PAWLY_NAV = [
  { id: 'decisions', label: 'The brief' },
  { id: 'what', label: 'What is Pawly' },
  { id: 'logo', label: 'Logo' },
  { id: 'colour', label: 'Colour palette' },
  { id: 'fonts', label: 'Typography' },
  { id: 'dieline', label: 'Dieline' },
  { id: 'icons', label: 'Benefit icons' },
  { id: 'fold', label: 'Fold it' },
];

export const PawlyCaseStudy: React.FC = () => (
  <>
    <Decisions />
    <WhatIsPawly />
    <LogoSection />
    <ColourPalette />
    <FontsUsed />
    <Dieline />
    <BenefitIcons />
    <FoldIt />
  </>
);
