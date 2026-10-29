export type ViewState = 'HOME' | 'identity' | 'PROJECTS' | 'CONTACT' | 'project-detail' | '404';

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
  tldrImage?: string;   // optional picture shown on the right of the tl;dr
  tldrImageAspect?: number;  // its width over its height (Pawly's cat is 0.6971); the picture is shown the same height as the cat, whatever its shape
  tldrImageAlt?: string;
  tldrImageShadow?: boolean;   // a soft shadow on the ground under the picture
  group?: string;              // who worked on it ("6 people"), shown under the title with the role and the date
  myRole?: string;             // what the designer did on it
  titleLines?: string[];       // where the big title breaks into lines, when it should not break at every space
  headerNote?: string;        // a line under the year and category at the top of the project page
  tldrImageNotes?: boolean;    // musical notes come out of the saxophone's bell while the magazine's music plays (Sonic)
  tldr?: string;   // the short summary at the very top of the project page
  images?: string[];
  mockups?: string[];
  pages?: string[];
  book?: string[];   // every page in reading order (cover, spreads as left+right, back cover), shown as a book you flip by clicking
  youtubeId?: string;
  videoSrc?: string;
  coverImage?: string;
}

export const NAV_ITEMS: { id: ViewState; label: string }[] = [
  { id: 'identity', label: 'About' },
  { id: 'PROJECTS', label: 'Works' },
  { id: 'CONTACT', label: 'Connect' },
];