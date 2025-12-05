export type ViewState = 'HOME' | 'ABOUT' | 'EXPERIENCE' | 'PROJECTS' | 'SKILLS' | 'CONTACT';

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
}

export const NAV_ITEMS: { id: ViewState; label: string }[] = [
  { id: 'HOME', label: '01. Intro' },
  { id: 'ABOUT', label: '02. Identity' },
  { id: 'EXPERIENCE', label: '03. Timeline' },
  { id: 'PROJECTS', label: '04. Works' },
  { id: 'SKILLS', label: '05. Arsenal' },
  { id: 'CONTACT', label: '06. Connect' },
];