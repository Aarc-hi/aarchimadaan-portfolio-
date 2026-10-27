import React from 'react';
import { AlignrProblem } from './AlignrProblem';
import { AlignrResearch, AlignrInsights } from './AlignrResearch';
import { AlignrHow } from './AlignrHow';
import { AlignrBuild, AlignrExplorations, AlignrTesting } from './AlignrBuild';

// The sections of the Alignr page, in order. The ids drive the side nav in ProjectDetailView.
// (The prototype video comes after these, from the project's youtubeId.)
export const ALIGNR_NAV = [
  { id: 'alignr-problem', label: 'The problem' },
  { id: 'alignr-audience', label: 'Target audience', sub: true },
  { id: 'alignr-research', label: 'Types of slouching' },
  { id: 'alignr-insights', label: 'Insights' },
  { id: 'alignr-how', label: 'How it works' },
  { id: 'alignr-building', label: 'Building it' },
  { id: 'alignr-explorations', label: 'Form', sub: true },
  { id: 'alignr-testing', label: 'Testing' },
];

export const AlignrCaseStudy: React.FC = () => (
  <>
    <AlignrProblem />
    <AlignrResearch />
    <AlignrInsights />
    <AlignrHow />
    <AlignrBuild />
    <AlignrExplorations />
    <AlignrTesting />
  </>
);
