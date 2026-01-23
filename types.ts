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
}

export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  techStack: string[];
  link: string;
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
