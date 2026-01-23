import { Memory, Project } from './types';

// The Walker's path points for the footstep engine
export const WALKER_PATH = [
  {x: 15, y: 35}, // Cali
  {x: 28, y: 32}, // NY
  {x: 40, y: 45}, // Mid Atlantic
  {x: 48, y: 28}, // Paris
  {x: 55, y: 35}, // Egypt
  {x: 70, y: 30}, // India
  {x: 78, y: 32}, // China
  {x: 82, y: 60}, // Indo
  {x: 88, y: 75}, // Perth
];

export const MEMORIES: Memory[] = [
  {
    id: 'm_cali',
    title: 'The Silicon Dream',
    description: 'Landing in California. The energy is electric. Every coffee shop conversation is about changing the world. I found my tribe here.',
    date: '2018 - Present',
    emotion: 'Ambition',
    color: '#6c5ce7',
    location: 'California',
    icon: 'bridge',
    coordinates: { x: 12, y: 32 } // West Coast
  },
  {
    id: 'm_paris',
    title: 'City of Light',
    description: 'A summer of art, philosophy, and getting lost in cobblestone streets. This is where I learned that engineering needs aesthetics to truly matter.',
    date: '2016',
    emotion: 'Inspiration',
    color: '#fdcb6e',
    location: 'Paris',
    icon: 'tower',
    coordinates: { x: 48, y: 22 } // Western Europe
  },
  {
    id: 'm_china',
    title: 'Roots & Heritage',
    description: 'The foundation. Growing up surrounded by ancient history and rapid modernization. The hustle of the streets and the quiet of the mountains formed my resilience.',
    date: '1995 - 2010',
    emotion: 'Origin',
    color: '#d63031',
    location: 'China',
    icon: 'pagoda',
    coordinates: { x: 75, y: 32 } // East Asia
  },
  {
    id: 'm_perth',
    title: 'The Quiet Coast',
    description: 'Perth taught me the value of silence and space. Endless sunsets over the Indian Ocean, university days, and finding clarity in isolation.',
    date: '2011 - 2015',
    emotion: 'Growth',
    color: '#0984e3',
    location: 'Perth',
    icon: 'skyscraper',
    coordinates: { x: 88, y: 80 } // Australia
  }
];

export const STATIC_ELEMENTS = [
  // --- TEXTURE LABELS (Typography layer) ---
  { id: 'txt_pacific', type: 'text_large', x: 25, y: 65, label: 'The Great Pacific' },
  { id: 'txt_atlantic', type: 'text_medium', x: 38, y: 40, label: 'Atlantic' },
  { id: 'txt_indian', type: 'text_medium', x: 68, y: 70, label: 'Indian Ocean' },
  { id: 'txt_eurasia', type: 'text_small', x: 60, y: 15, label: 'Terra Cognita' },

  // --- OCEAN LIFE (In the water gaps) ---
  { id: 's_kraken', type: 'kraken', x: 35, y: 55, label: 'The Deep' },
  { id: 's_whale_pac', type: 'whale', x: 10, y: 60, label: '' },
  { id: 's_whale_ind', type: 'whale_tail', x: 78, y: 82, label: '' },
  { id: 's_ship_1', type: 'ship', x: 32, y: 25, label: '' },
  { id: 's_ship_2', type: 'ship', x: 85, y: 55, label: 'Trade Route' },

  // --- LANDMARKS (On the landmasses) ---
  // Americas
  { id: 's_rockies', type: 'mountains', x: 15, y: 20, label: 'Rockies' },
  { id: 'f_canada', type: 'forest', x: 15, y: 10, label: '' },
  { id: 'c_ny', type: 'village', x: 25, y: 28, label: 'NYC' },
  { id: 's_andes', type: 'mountains', x: 22, y: 75, label: 'Andes' },
  { id: 'f_amazon', type: 'jungle', x: 28, y: 60, label: 'Amazonia' },

  // Europe / Africa
  { id: 's_alps', type: 'mountains', x: 52, y: 18, label: 'Alps' },
  { id: 'c_london', type: 'village', x: 46, y: 16, label: 'London' },
  { id: 'c_pyramid', type: 'pyramid', x: 55, y: 35, label: 'Giza' },
  { id: 'f_congo', type: 'jungle', x: 52, y: 55, label: '' },
  
  // Asia
  { id: 's_himalaya', type: 'mountains', x: 70, y: 28, label: 'Himalayas' },
  { id: 'f_siberia', type: 'forest', x: 75, y: 10, label: '' },
  { id: 's_dragon', type: 'dragon', x: 85, y: 20, label: 'Here be Dragons' },
  { id: 'c_bali', type: 'island', x: 80, y: 60, label: 'Bali' },

  // Oceania
  { id: 's_opera', type: 'opera', x: 92, y: 85, label: 'Sydney' },
  { id: 'd_compass', type: 'compass_rose', x: 10, y: 85, label: '' },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Nebula Analytics',
    role: 'Lead Frontend Engineer',
    description: 'A high-performance data visualization dashboard processing 1M+ rows of real-time satellite telemetry.',
    techStack: ['React', 'D3.js', 'WebSockets', 'AWS'],
    link: '#',
    impact: 'Reduced incident response time by 40%.'
  },
  {
    id: 'p2',
    title: 'Void Payment Gateway',
    role: 'Full Stack Developer',
    description: 'Architected a secure, serverless payment infrastructure for a decentralized commerce platform.',
    techStack: ['Node.js', 'TypeScript', 'Solidity', 'Redis'],
    link: '#',
    impact: 'Processed $5M in volume securely in first quarter.'
  },
  {
    id: 'p3',
    title: 'Orbit Design System',
    role: 'Product Designer / Dev',
    description: 'Created a unified UI/UX design language and component library used across 12 internal products.',
    techStack: ['Figma', 'Storybook', 'Tailwind', 'React'],
    link: '#',
    impact: 'Increased developer velocity by 25%.'
  },
  {
    id: 'p4',
    title: 'Hyper-Grid',
    role: 'Creative Developer',
    description: 'Experimental WebGL framework for rendering massive datasets in 3D space with zero latency.',
    techStack: ['Three.js', 'WebGL', 'Rust'],
    link: '#',
    impact: 'Featured on Awwwards Site of the Day.'
  },
  {
    id: 'p5',
    title: 'Chrono Keep',
    role: 'Mobile Lead',
    description: 'A productivity app that uses AI to predict energy levels and schedule tasks accordingly.',
    techStack: ['React Native', 'TensorFlow.js', 'Firebase'],
    link: '#',
    impact: '100k+ MAU within 6 months.'
  }
];
