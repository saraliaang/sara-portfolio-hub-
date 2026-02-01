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
    description: "Moving to the United States was my first ‘re-rendering’ of reality, shifting my world from the familiar streets of my hometown to a global stage. My time studying Psychology taught me to look inward, decoding the ‘why’ behind human behavior. But the spark truly ignited during a summer visit to the Meta campus. Seeing innovation in action, offered a glimpse into a life spent building alongside technology —made me realize I didn't just want to be a spectator of the future ,but be a part of it.",
    date: '2014 - 2018',
    emotion: 'Ambition',
    color: '#6c5ce7',
    location: 'United States',
    icon: 'bridge',
    coordinates: { x: 12, y: 32 }, // West Coast
    mediaGif: '/media/united-states.gif',
    mediaAlt: 'Golden Gate bridge at dusk'
  },
  {
    id: 'm_paris',
    title: 'City of Light',
    description: 'Living in Paris for a six-month exchange, I found myself adapting to the rhythm of the city almost instantly. The cafe latte after lunch, night walks along the Seine, and an oil painting class around the corner became my new normal. We stopped opening textbooks and started sitting on the floor directly in front of the masterpieces, discussing pen strokes. I started appreciating beauty not as an abstract concept, but as a series of deliberate, tactile choices. I fell in love with design there, realizing that whether it is a canvas or a line of code, every detail is an opportunity to create something that actually connects with people.',
    date: '2018',
    emotion: 'Inspiration',
    color: '#fdcb6e',
    location: 'Paris',
    icon: 'tower',
    coordinates: { x: 48, y: 22 }, // Western Europe
    mediaGif: '/media/paris.gif',
    mediaAlt: 'Paris street scene'
  },
  {
    id: 'm_china',
    title: 'Roots & Heritage',
    description: 'China is a place of contradictions—thousands of years of ancient history sitting right next to rapid, neon-lit modernisation. If there is a heartbeat to the culture, it’s the philosophy of the **Dao**. It’s the idea of moving with the flow of the world rather than fighting against it, finding balance in the chaos. I grew up watching this balance play out in my own family. Since 1989, I’ve seen my parents’ restaurant grow from a tiny street shop into one of the most well-known spots in the city. Their hard work was my education; it’s what funded my journey to the United States. From them, I didn’t just learn how to run a business. I learned a deep, quiet resilience. It’s the reason that after graduating, I chose to go back and help. I wanted to apply everything I’d learned abroad to the place that made my journey possible, blending that old-world grit with a modern perspective.',
    date: 'since 1994',
    emotion: 'Origin',
    color: '#d63031',
    location: 'China',
    icon: 'pagoda',
    coordinates: { x: 75, y: 32 }, // East Asia
    mediaGif: '/media/china.gif',
    mediaAlt: 'Pagoda in mist'
  },
  {
    id: 'm_perth',
    title: 'The Quiet Coast',
    description: 'In 2025, I moved to Perth, a city where quiet nature and a modern pace sit right next to each other. Joining She Codes shortly after arriving changed the rhythm of my weeks; I found myself surrounded by a community of supportive, driven people who made the transition feel a lot less lonely. Between the new faces and the fresh coastal air, Australia quickly started to feel like a place where I could actually build a life. Can’t wait see where the journey would take me next.',
    date: '2025 - now',
    emotion: 'Growth',
    color: '#0984e3',
    location: 'Australia',
    icon: 'skyscraper',
    coordinates: { x: 88, y: 80 }, // Australia
    mediaGif: '/media/perth.gif',
    mediaAlt: 'Ocean shoreline at sunset'
  }
];

export const FRAME_IMAGE = '/media/frame.png';

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
    id: 'p3',
    title: "Sara's Hub",
    role: 'Creative Developer · Product Designer',
    thesis: 'A cinematic portfolio that feels like a living world.',
    problemSpace: 'Most portfolios read like documents. They list skills, but they rarely feel like you. I wanted a format that communicates craft, atmosphere, and intent in the first five seconds.',
    designIntent: 'Shape the site as two parallel worlds (Voyager and Alchemist) so exploration replaces scrolling, with a Harry Potter–inspired magical atmosphere. Interactions should feel spell-like: hover awakens, summon confirms, and every action leaves a trace.',
    technicalExecution: 'Gesture-ready input layer with fallback cursor control.\nWand-inspired cursor and interactive particle fields to animate each world.\nVoyager map is inspired by The Marauder’s Map with location icons, whisper-like text, ink spill selection, and wandering footprints.\nAlchemist uses a pensive backdrop with floating project cards for spell-like navigation.',
    futureHorizon: 'Keep expanding the experience with new worlds, richer interactions, and updated gesture-driven journeys.',
    techStack: ['MediaPipe', 'TypeScript', 'React', 'Framer Motion', 'Tailwind'],
    githubLink: 'https://github.com/saraliaang/sara-porfolio-hub-',
    demoLink: 'https://saralianghub.netlify.app/',
    impact: 'Turned a prototype into a shippable, immersive experience.'
  },
  {
    id: 'p1',
    title: 'Teampulse',
    role: 'Product designer · Frontend developer · UX strategist',
    thesis: 'Designing wellbeing as a system, not a checkbox',
    problemSpace: 'In high-pressure environments, the "silent struggle" of burnout often goes unnoticed until it is too late. Team wellbeing tools often feel like corporate surveys — emotionally distant, task-focused, and reactive.',
    designIntent: 'TeamPulse treats wellbeing as an ongoing relationship — calm, human, and non-judgmental, not just isolated data entry. Used soft gradients and warm neutrals to break the corporate stigma, replacing numeric ratings with emoji-based check-ins to prioritize psychological safety.',
    technicalExecution: 'Emoji-based weekly check-ins to reduce emotional friction.\nPrivate self-reflection history for personal awareness.\nManager dashboards showing trends, not individuals.\nLight-touch gamification through streak points and a Mental Garden, where consistent check-ins nurture growth — encouraging habit formation without pressure.',
    futureHorizon: 'Turning trend insights into gentle, real-world actions — such as a coffee token or a pause prompt — supporting care and de-escalation beyond the screen.',
    techStack: ['React', 'Django REST', 'PostgreSQL', 'Data visualisation'],
    githubLink: 'https://github.com/SheCodesAus/full-stack-frogs_frontend/tree/main/teampulse-frontend',
    demoLink: 'https://teampulse-app.netlify.app/',
    impact: 'Reduced incident response time by 40%.'
  },
  {
    id: 'p2',
    title: 'Pastport',
    role: 'Full Stack Developer',
    thesis: 'A specialized platform designed to fund personal journeys through time.',
    problemSpace: "I built a space for 'impossible' adventures, targeting history enthusiasts and 'regret fixers' who need a way to fund the massive scientific costs of temporal travel. The barrier to entry isn't just technology it's the astronomical funding required to push past the limits of physics",
    designIntent: 'The strategy was to make the physics feel tangible by linking funding goals directly to the "Destination Year." I replaced static percentages with live "Time Departure" progress bars, turning a simple donation into an immersive countdown to a historical launch.',
    technicalExecution: 'A full-stack platform built with a Django REST backend supporting:\nFundraiser creation for imagined trips to historical moments.\nPledge system to fund experiences.\nLive progress & animations that visualise how close a journey is to “time departure”.\nReact front-end with dynamic UI and smooth transitions.\nAPI endpoints for users, fundraisers, and pledges.',
    futureHorizon: 'My next step is to implement "Time Travel Milestones," where hitting specific funding thresholds triggers unique UI animations, further gamifying the experience.',
    techStack: ['Node.js', 'TypeScript', 'Solidity', 'Redis'],
    githubLink: 'https://github.com/saraliaang/crowdfunding_backend',
    demoLink:'https://pastport-fundraising.netlify.app/',
    impact: 'Processed $5M in volume securely in first quarter.'
  },
  {
    id: 'p4',
    title: 'Gesture Lab',
    role: 'UX / interaction designer ·  experimental engineer',
    thesis: 'Exploring hands-as-input interactions.',
    problemSpace: 'Touchscreens restrict how we interact with digital interfaces, limiting input to taps and swipes even as devices grow more capable. Users crave more natural, expressive interactions beyond glass and buttons.',
    designIntent: 'Gesture Lab was created as a foundational prototype for future gesture-controlled applications. Through iterative testing, the gesture set was intentionally refined to prioritize gestures that are easy to learn, resilient to noise, and unlikely to be misinterpreted. The goal was to establish a reliable interaction language that can scale into real-world, camera-driven experiences.',
    technicalExecution: 'Real-time camera input with hand tracking.\nCore gesture vocabulary (wake, confirm, scroll, summon, dismiss).\nVisual cursor mapped to hand movement with adjustable sensitivity.\nGesture guide overlay to support learnability.\nMouse fallback for hybrid interaction.',
    futureHorizon: 'Evolving Gesture Lab into a reusable interaction framework that powers gesture-controlled navigation, storytelling, and portfolio experiences.',
    techStack: ['MediaPipe', 'JavaScript', 'HTML', 'CSS'],
    githubLink: 'https://github.com/saraliaang/gesture-app',
    impact: 'Established a reliable gesture vocabulary for future camera-driven experiences.'
  },
  {
    id: 'p5',
    title: 'Saving Cedric',
    role: 'Auror',
    thesis: 'A single life saved can shift the entire timeline.',
    problemSpace: 'Cedric is worth saving because of who he is courageous, smart, and full of integrity. The challenge is to change his fate of being killed by Voldermort in triwizard tornament.',
    designIntent: 'Intercept the Portkey route, replace the Cup trigger with a safe diversion, and extract Cedric before the graveyard trap activates — all without revealing the intervention.',
    technicalExecution: 'Create a decoy Portkey to redirect Cedric away from the trap.\nDeploy protective wards at the Cup site to delay interception.\nCoordinate a rapid extraction and concealment protocol with a time-bound escape window.',
    futureHorizon: 'Extend the intervention framework to protect other witches and wizards lost to Voldemort’s rise.',
    techStack: ['Expecto Patronum', 'protego maxima', 'Episkey'],

    impact: '100k+ MAU within 6 months.'
  }
];
