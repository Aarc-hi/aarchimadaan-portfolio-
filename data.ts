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
    company: 'Anant National University WITH festival',
    period: 'February 2025',
    points: [
      'Supported graphic design and marketing strategies.',
      'Coordinated on-stage logistics for artists and props.',
      'Performed research with the team and department heads.'
    ]
  }
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'UI Design for an App',
    date: 'July 2024',
    description: [
      'Developed user-centered designs through research and user testing.',
      'Created wireframes, prototypes, and design specifications.',
      'Maintained design documentation for consistency.'
    ],
    tech: ['Sketch', 'Figma', 'Adobe Suite']
  },
  {
    id: 'p2',
    title: 'Posture Corrector',
    date: 'April 2025',
    description: [
      'Designed interactive products utilizing C++ and physical sensors.',
      'Developed user-friendly interfaces to enhance user experience.',
      'Conducted usability testing to improve functionality.'
    ],
    tech: ['C++', 'Sensors', 'Prototyping']
  },
  {
    id: 'p3',
    title: 'Publication Design',
    date: 'July 2025',
    description: [
      'Utilized InDesign and Illustrator to create design elements.',
      'Designed covers, feature spreads, and section dividers.',
      'Applied typography and color theory with consistency.'
    ],
    tech: ['InDesign', 'Illustrator', 'Typography']
  },
  {
    id: 'p4',
    title: '3D/VR World Building',
    date: 'September 2025',
    description: [
      'Developed 3D models using Blender and Unity for VR.',
      'Handled VR headset for effective testing and UX evaluation.',
      'Evaluated usability and immersion through user testing.'
    ],
    tech: ['Blender', 'Unity', 'VR']
  }
];

export const SKILLS = {
  design: ['Adobe Creative Suite', 'Figma', 'UI Design', 'Digital Art', '3D Modelling', 'Prototyping', 'Video Editing'],
  tools: ['Blender', 'Unity', 'SketchUp', 'Procreate', 'Photoshop', 'Illustrator'],
  research: ['UX Research', 'User-Centered Thinking', 'A/B Testing'],
  soft: ['Adaptability', 'Communication', 'Empathy', 'Team Collaboration']
};
