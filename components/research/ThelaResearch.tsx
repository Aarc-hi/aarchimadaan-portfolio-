import React from 'react';
import { CardSorting } from './CardSorting';
import { DayInLife } from './DayInLife';
import { InsightsSection } from './InsightsSection';
import { MarketGlance } from './MarketGlance';
import { PersonaCards } from './PersonaCards';
import { Shadowing } from './Shadowing';
import { StakeholderMap } from './StakeholderMap';
import { ThemeExplorer } from './ThemeExplorer';
import { EvidenceProvider } from './shared';

// The chapters of the research, in order. The project page's side panel lists them under "Findings".
export const RESEARCH_NAV: { id: string; label: string }[] = [
  { id: 'ch-market', label: 'Market' }, { id: 'ch-interviews', label: 'Interviews' }, { id: 'ch-personas', label: 'Personas' },
  { id: 'ch-stakeholders', label: 'Stakeholders' }, { id: 'ch-day', label: 'A day' }, { id: 'ch-shadowing', label: 'Shadowing' },
  { id: 'ch-sorting', label: 'Card sorting' }, { id: 'ch-insights', label: 'Insights' },
];

// `afterMarket` is whatever goes between the market chapter and the interviews (the research question).
export const ThelaResearch: React.FC<{ afterMarket?: React.ReactNode }> = ({ afterMarket }) => (
  <EvidenceProvider>
    <MarketGlance />
    {afterMarket}
    <ThemeExplorer />
    <PersonaCards />
    <StakeholderMap />
    <DayInLife />
    <Shadowing />
    <CardSorting />
    <InsightsSection />
  </EvidenceProvider>
);
