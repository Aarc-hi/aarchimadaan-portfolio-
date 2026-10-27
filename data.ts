import { Experience, Project } from './types';

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp1',
    role: 'Graphic Design Intern',
    company: 'Teamarcs Technologies',
    period: 'Dec 2024 - Jan 2025',
    points: [
      'Created social media content and graphics, and designed business cards and print materials.',
      'Improved skills in Adobe Photoshop, Illustrator, and Figma.',
      'Contributed to UI design by enhancing layouts and user experience.'
    ]
  },
  {
    id: 'exp2',
    role: 'Summer Intern',
    company: 'Serendipity Arts Foundation',
    period: 'Jun 2026 - Jul 2026',
    points: [
      'Supported in making creatives and layouts for the website.',
      'Helped with research and created assets for events alongside the design team.'
    ]
  },
  {
    id: 'exp3',
    role: 'Volunteer',
    company: 'Serendipity Arts Festival',
    period: 'December 2025',
    points: [
      'Supported artists with installations, set design, and spatial setup.',
      'Handled coordination and problem-solving during live exhibitions and public-facing event environments.'
    ]
  }
];

export const SKILLS: string[] = [
  'UI Design',
  'Identity Design',
  'UX Research',
  'Attention to Detail',
  'User-Centered Thinking',
  'Video Editing',
  'Sound Design',
  'Prototyping',
  'Digital Art',
  'Adaptability',
  'Fast Learning',
  '3D Modelling',
  'Team Collaboration'
];

export const TOOLS: string[] = [
  'Figma',
  'Adobe InDesign',
  'Photoshop',
  'Illustrator',
  'Blender',
  'Procreate',
  'Claude'
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Thela thaila thikana',
    date: 'March 2025',
    year: '2025',
    category: 'UX Research & Zine',
    description: [
      'This project explores the **everyday ecosystem of a municipal market**, focusing on the interactions between **vendors, visitors, and workers**.',
      'Through extensive UX research methods, the study examines how these stakeholders **cooperate, conflict, and adapt** within a shared space.'
    ],
    concept: 'The project translates research insights into a **multisensory storytelling format**, moving beyond traditional reports. The zine uses narrative, visuals, and interactive elements along with sensory cues like smell and audio to represent the emotional and social layers of the market. By focusing on **lived experiences** rather than just data, the concept allows readers to understand the system intuitively, highlighting both visible interactions and underlying tensions.',
    researchQuestion: 'What drives cooperation and conflict among stakeholders in Municipal Market, and how does it shape their openness or resistance to change?',
    tldr: 'A UX research study of a municipal market, told as a **multisensory zine** that lets readers feel how vendors, visitors and workers cooperate, clash and adapt. It asks what drives **cooperation and conflict** among stakeholders and how that shapes their openness or resistance to change.',
    tech: ['UX Research', 'Ethnography', 'Visual Storytelling', 'Zine Design'],
    // the zine, as a book you flip by clicking: the front cover, then each spread as its left and right page, then the back cover
    // (the same nine images as before, with each spread cut down its fold; the originals stay in /Municipal market/)
    coverImage: '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_1.jpg',
    book: [
      '/Municipal market/book/front.jpg',
      ...Array.from({ length: 7 }, (_, i) => [`/Municipal market/book/p${i + 1}L.jpg`, `/Municipal market/book/p${i + 1}R.jpg`]).flat(),
      '/Municipal market/book/back.jpg'
    ]
  },
  {
    id: 'p2',
    title: 'Alignr',
    date: 'April 2025',
    year: '2025',
    category: 'Product Design',
    description: [
      'Alignr is a **wearable posture corrector** designed for students and desk workers who spend long hours sitting.',
      'The device helps users become aware of poor posture habits by **detecting slouching** and gently alerting them after a few seconds.'
    ],
    concept: 'The device is designed as a compact, lightweight wearable that easily attaches to clothing. It focuses on **subtle intervention** rather than constant correction, encouraging users to build awareness over time without disrupting their workflow.',
    problemStatement: 'How might we create a **small, wearable device** to make users **notice and adjust for poor posture** in real time without disruption?',
    tldr: 'A small wearable that **spots slouching** and gently nudges students and desk workers to fix their posture. It alerts you after a few seconds of slouching, with **subtle nudges** instead of constant correction, so awareness builds over time without breaking your flow.',
    tech: ['Arduino', 'C++', 'Sensors', 'Product Prototyping'],
    coverImage: '/ALIGNR/alignr-poster.jpg',
    images: ['/ALIGNR/alignr-poster.jpg'],   // the two renders that used to follow it now live in the page's Explorations
    youtubeId: '-rb_0nzve3Y'
  },
  {
    id: 'p3',
    title: 'SONIC',
    date: 'July 2025',
    year: '2025',
    category: 'Editorial Design',
    description: [
      'Sonic is a magazine designed to explore **music genres**, their subgenres, influential artists, and iconic instruments.',
      'Each spread visually reflects the energy of its genre through **typography, scale shifts, alignment play, and structured negative space**.'
    ],
    concept: 'Sonic translates **musical rhythm and genre identity** into a strong visual language through typography and structured layouts. As an exclusive editorial space, it brings together a **community of music enthusiasts**.',
    problemStatement: 'How might we design a music magazine that effectively represents **multiple genres** while maintaining a **clear, engaging, and navigable visual system**?',
    tldr: 'A magazine about **music genres**, where each spread takes on the energy of its genre through **typography** and layout. It covers subgenres, influential artists and iconic instruments, held together by scale shifts, alignment play and structured negative space.',
    tech: ['InDesign', 'Photoshop', 'Typography', 'Grid Systems'],
    coverImage: '/Sonic magazine visual stock/FIRST IMAGE LARGE.png', // the home cover, no longer shown on the project page
    pages: [
      '/Sonic magazine visual stock/small frame with all pages.png'
    ],
    book: [
      '/Sonic magazine visual stock/book/front.jpg',
      ...Array.from({ length: 11 }, (_, i) => [`/Sonic magazine visual stock/book/p${i + 1}L.jpg`, `/Sonic magazine visual stock/book/p${i + 1}R.jpg`]).flat(),
      '/Sonic magazine visual stock/book/back.jpg'
    ]
  },
  {
    id: 'p4',
    title: 'Pawly',
    date: 'Jan 2026',
    year: '2026',
    category: 'Packaging Design',
    description: [
      'Pawly is a packaging design project for **dry salmon-based cat food**, created to make pet nutrition feel **approachable and engaging** for owners.',
      'The packaging aims to stand out in a saturated pet food market by combining **functionality with a distinct visual identity**.'
    ],
    concept: 'The concept draws inspiration from **orange cats**, known for their playful and expressive personalities. This idea is translated into the packaging through warm tones, character-driven visuals, and a lively composition.',
    problemStatement: 'How might we design cat food packaging that **stands out visually on shelves** while also improving **usability** and maintaining **product freshness** for everyday use?',
    tldrImage: '/PAWLY/pawly/cat-shout.png',
    tldr: 'Packaging for a **dry salmon-based cat food**, inspired by **orange cats** to feel approachable and engaging. Warm tones, character-driven visuals and a lively composition help it stand out in a saturated pet food market while staying practical for everyday use.',
    tech: ['Illustrator', 'Packaging Design', 'Branding', 'Visual Identity'],
    images: [
      '/PAWLY/ChatGPT Image Feb 19, 2026, 10_34_44 PM.png',
      '/PAWLY/portfolio pawlu packet-03.png'
    ]
  },
  {
    id: 'p5',
    title: 'The Pen Hospital',
    date: 'Nov 2025',
    year: '2025',
    category: '3D World Building / VR',
    description: [
      'The Pen Hospital is a **virtual reality experience** inspired by a **real pen repair shop in Thrissur**. Set during the 1960s Land Reform period, it explores how everyday objects—like pens used to sign land contracts, can carry **historical and emotional significance**.',
      'Users enter a hospital-like environment where they interact with and repair these pens, engaging with both the space and its context.'
    ],
    concept: 'The project reimagines **broken pens as patients**, turning repair into an **act of care** rather than utility. Through this metaphor, the interaction reflects ideas of creativity, labor, and the lasting impact of decisions tied to these objects. The experience uses simple actions to create a more reflective and meaningful engagement.',
    problemStatement: 'How might we use **virtual reality** to transform everyday objects into **meaningful interactive experiences** that communicate deeper **historical and emotional narratives**?',
    tldr: 'A VR experience based on a **real pen repair shop in Thrissur**, where repairing broken pens becomes an **act of care**. Set in the 1960s Land Reform period, it turns the pens once used to sign land contracts into patients, so simple actions carry history and emotion.',
    tech: ['Unity', 'Blender'],
    coverImage: '/3d world building/Screenshot 2026-04-30 180238ev.png',
    images: ['/3d world building/Screenshot 2026-04-30 180238ev.png'],
    videoSrc: '/3d world building/video walkthrough VR (2).mp4'
  }
];
