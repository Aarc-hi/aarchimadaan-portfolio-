import { Experience, Project } from './types';

export const EXPERIENCES: Experience[] = [
  {
    id: 'exp1',
    role: 'Graphic Design Intern',
    company: 'Teamarcs Technologies',
    period: 'Dec 2024 - Jan 2025',
    points: [
      'Created social media content and graphics for the organization.',
      'Enhanced skills in Photoshop, Illustrator, and Figma.',
      'Contributed to UI design focusing on layout and UX improvements.'
    ]
  },
  {
    id: 'exp2',
    role: 'Volunteer',
    company: 'Serendipity Arts Festival',
    period: 'December 2025',
    points: [
      'Supported on-site crowd management and ensured smooth visitor flow across event spaces.',
      'Coordinated with the set design, graphic design, and exhibition design teams to align visual execution.',
      'Managed interactions with diverse age groups, facilitating audience engagement with visual art installations.'
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'thela thaila thikana',
    date: 'Dec 2024',
    year: '2024',
    category: 'UX Research & Zine',
    description: [
      'This project explores the everyday ecosystem of a municipal market, focusing on the interactions between vendors, visitors, and workers.',
      'Through extensive UX research methods, the study examines how these stakeholders cooperate, conflict, and adapt within a shared space.'
    ],
    concept: 'The project translates research insights into a multisensory storytelling format, moving beyond traditional reports. The zine uses narrative, visuals, and interactive elements along with sensory cues like smell and audio to represent the emotional and social layers of the market. By focusing on lived experiences rather than just data, the concept allows readers to understand the system intuitively, highlighting both visible interactions and underlying tensions.',
    researchQuestion: 'What drives cooperation and conflict among stakeholders in Municipal Market, and how does it shape their openness or resistance to change?',
    tech: ['UX Research', 'Ethnography', 'Visual Storytelling', 'Zine Design'],
    images: [
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_1.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_2.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_3.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_4.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_5.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_6.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_7.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_8.jpg',
      '/Municipal market/1777543906260-8c06fa68-3648-436b-85eb-158532b9d317_9.jpg'
    ]
  },
  {
    id: 'p2',
    title: 'SitRight Posture',
    date: 'April 2025',
    year: '2025',
    category: 'Product Design',
    description: [
      'SitRight is a wearable posture corrector designed for students and desk workers who spend long hours sitting.',
      'The device helps users become aware of poor posture habits by detecting slouching and gently alerting them after a few seconds.'
    ],
    concept: 'The device is designed as a compact, lightweight wearable that easily attaches to clothing. It focuses on subtle intervention rather than constant correction, encouraging users to build awareness over time without disrupting their workflow.',
    problemStatement: 'How might we create a small, wearable device to make users notice and adjust for poor posture in real time without disruption?',
    tech: ['Arduino', 'C++', 'Sensors', 'Product Prototyping'],
    images: ['/Sit right/WhatsApp Image 2026-04-28 at 11.14.04 AM.jpeg', '/Sit right/WhatsApp Image 2026-04-28 at 11.14.08 AM.jpeg'],
    youtubeId: '-rb_0nzve3Y'
  },
  {
    id: 'p3',
    title: 'SONIC magazine',
    date: 'July 2025',
    year: '2025',
    category: 'Editorial Design',
    description: [
      'Sonic is a magazine designed to explore music genres, their subgenres, influential artists, and iconic instruments.',
      'Each spread visually reflects the energy of its genre through typography, scale shifts, alignment play, and structured negative space.'
    ],
    concept: 'Sonic translates musical rhythm and genre identity into a strong visual language through typography and structured layouts. As an exclusive editorial space, it brings together a community of music enthusiasts.',
    problemStatement: 'How might we design a music magazine that effectively represents multiple genres while maintaining a clear, engaging, and navigable visual system?',
    tech: ['InDesign', 'Photoshop', 'Typography', 'Grid Systems'],
    mockups: [
      '/Sonic magazine visual stock/FIRST IMAGE LARGE.png',
      '/Sonic magazine visual stock/Untitled design (5).gif',
      '/Sonic magazine visual stock/SECOND IMAGE LARGE.png',
      '/Sonic magazine visual stock/THIRD IMAGE LARGE.png'
    ],
    pages: [
      '/Sonic magazine visual stock/small frame with all pages.png'
    ]
  },
  {
    id: 'p4',
    title: 'Pawly Cat Food',
    date: 'Sept 2025',
    year: '2025',
    category: 'Packaging Design',
    description: [
      'Pawly is a packaging design project for dry salmon-based cat food, created to make pet nutrition feel approachable and engaging for owners.',
      'The packaging aims to stand out in a saturated pet food market by combining functionality with a distinct visual identity.'
    ],
    concept: 'The concept draws inspiration from orange cats, known for their playful and expressive personalities. This idea is translated into the packaging through warm tones, character-driven visuals, and a lively composition.',
    problemStatement: 'How might we design cat food packaging that stands out visually on shelves while also improving usability and maintaining product freshness for everyday use?',
    tech: ['Illustrator', 'Packaging Design', 'Branding', 'Visual Identity'],
    images: [
      '/PAWLY/ChatGPT Image Feb 19, 2026, 10_34_44 PM.png',
      '/PAWLY/portfolio pawlu packet-03.png'
    ]
  },
  {
    id: 'p5',
    title: 'The Pen Hospital',
    date: 'Present',
    year: '2026',
    category: '3D World Building / VR',
    description: [
      'The Pen Hospital is a virtual reality experience inspired by a real pen repair shop in Thrissur. Set during the 1960s Land Reform period, it explores how everyday objects—like pens used to sign land contracts, can carry historical and emotional significance.',
      'Users enter a hospital-like environment where they interact with and repair these pens, engaging with both the space and its context.'
    ],
    concept: 'The project reimagines broken pens as patients, turning repair into an act of care rather than utility. Through this metaphor, the interaction reflects ideas of creativity, labor, and the lasting impact of decisions tied to these objects. The experience uses simple actions to create a more reflective and meaningful engagement.',
    problemStatement: 'How might we use virtual reality to transform everyday objects into meaningful interactive experiences that communicate deeper historical and emotional narratives?',
    tech: ['Unity', 'Blender'],
    coverImage: '/3d world building/Screenshot 2026-04-30 180238ev.png',
    images: ['/3d world building/Screenshot 2026-04-30 180238ev.png'],
    videoSrc: '/3d world building/video walkthrough VR (1).mp4'
  }
];

export const SKILLS = {
  design: ['Adobe Creative Suite', 'Figma', 'UI Design', 'Digital Art', '3D Modelling', 'Prototyping', 'Video Editing'],
  tools: ['Blender', 'Unity', 'Framer', 'Procreate', 'Photoshop', 'Illustrator'],
  research: ['UX Research', 'User-Centered Thinking', 'A/B Testing'],
  soft: ['Adaptability', 'Communication', 'Empathy', 'Team Collaboration']
};
