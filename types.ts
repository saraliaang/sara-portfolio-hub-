export enum ViewState {
  UNIVERSE = 'UNIVERSE',
  PERSONAL = 'PERSONAL',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  emotion: string; 
  color: string;
  location: string;
  icon: 'pagoda' | 'skyscraper' | 'tower' | 'bridge' | 'mountain' | 'code';
  coordinates: { x: number; y: number }; // Percentages 0-100
  mediaGif?: string;
  mediaAlt?: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  thesis: string;
  problemSpace: string;
  designIntent: string;
  technicalExecution: string;
  futureHorizon: string;
  techStack: string[];
  githubLink?: string;
  demoLink?: string;
  impact: string;
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
  velocity: { x: number; y: number };
}
