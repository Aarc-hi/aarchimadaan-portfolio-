export type ViewState = 'HOME' | 'identity' | 'PROJECTS' | 'CONTACT' | 'project-detail';

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  points: string[];
}

export interface Project {
  id: string;
  title: string;
  date: string;
  description: string[];
  tech: string[];
  year: string;
  category: string;
  problemStatement?: string;
  concept?: string;
  researchQuestion?: string;
  images?: string[];
  mockups?: string[];
  pages?: string[];
  youtubeId?: string;
  videoSrc?: string;
  coverImage?: string;
}

export const NAV_ITEMS: { id: ViewState; label: string }[] = [
  { id: 'HOME', label: '01. Intro' },
  { id: 'identity', label: '02. Identity' },
  { id: 'PROJECTS', label: '03. Works' },
  { id: 'CONTACT', label: '04. Connect' },
];