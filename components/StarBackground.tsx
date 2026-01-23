import React, { useEffect, useRef } from 'react';
import { ViewState } from '../types';

interface StarBackgroundProps {
  view: ViewState;
}

class Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
  alpha: number;
  
  constructor(w: number, h: number, view: ViewState) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.baseX = this.x;
    this.baseY = this.y;
    this.size = Math.random() * 2 + 1;
    this.density = (Math.random() * 20) + 1;
    this.alpha = Math.random() * 0.5 + 0.2;
    this.color = '255, 255, 255';
    
    if (view === ViewState.PERSONAL) {
       this.color = '255, 215, 0'; // Gold
    } else if (view === ViewState.PROFESSIONAL) {
       // Bright Cyan/White for Sci-Fi theme
       this.color = '34, 211, 238'; // Cyan-400
    }
  }

  update(mouse: { x: number; y: number }, view: ViewState) {
    // Mouse Interaction
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const forceDirectionX = dx / distance;
    const forceDirectionY = dy / distance;
    const maxDistance = 200;
    
    // Repel from cursor
    let force = 0;
    if (distance < maxDistance) {
        force = (maxDistance - distance) / maxDistance;
    }
    
    const directionX = forceDirectionX * force * this.density;
    const directionY = forceDirectionY * force * this.density;

    if (distance < maxDistance) {
        this.x -= directionX;
        this.y -= directionY;
    } else {
        if (this.x !== this.baseX) {
            const dx = this.x - this.baseX;
            this.x -= dx / 20;
        }
        if (this.y !== this.baseY) {
            const dy = this.y - this.baseY;
            this.y -= dy / 20;
        }
    }

    // Natural Drift
    this.x += Math.sin(Date.now() * 0.001 + this.density) * 0.2;
    this.y += Math.cos(Date.now() * 0.001 + this.density) * 0.2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const StarBackground: React.FC<StarBackgroundProps> = ({ view }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef<{ x: number, y: number }>({ x: -1000, y: -1000 });
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleVirtualCursor = (e: Event) => {
        const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
        if (!detail) return;
        mouse.current.x = detail.x;
        mouse.current.y = detail.y;
    };
    window.addEventListener('virtual-cursor', handleVirtualCursor as EventListener);
    return () => {
      window.removeEventListener('virtual-cursor', handleVirtualCursor as EventListener);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = [];
      const count = view === ViewState.UNIVERSE ? 150 : 60;
      for (let i = 0; i < count; i++) {
        particles.current.push(new Particle(canvas.width, canvas.height, view));
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [view]);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.current.forEach(p => {
        p.update(mouse.current, view);
        p.draw(ctx);
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [view]);

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
       {/* Ambient Gradient */}
       <div className={`absolute inset-0 transition-colors duration-1000 ${
           view === ViewState.UNIVERSE ? 'bg-gradient-to-b from-[#0a0510] to-black' : 
           view === ViewState.PERSONAL ? 'bg-gradient-to-b from-[#1a1005] to-black' :
           // Brighter Blue/Slate for Professional View
           'bg-gradient-to-b from-[#0f172a] to-[#020617]' 
       }`}></div>
       <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
