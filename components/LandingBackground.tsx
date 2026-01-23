
import React, { useEffect, useRef } from 'react';
import { ViewState } from '../types';

interface LandingBackgroundProps {
  hoveredSide: ViewState | null;
}

export const LandingBackground: React.FC<LandingBackgroundProps> = ({ hoveredSide }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- CONFIGURATION ---
    const PARTICLE_COUNT = width > 1000 ? 1500 : 800;
    const FOV = 300;
    const HORIZON_Y = height * 0.4;
    const VOYAGER_CHARS = ["旅人", "bonjour", "G'day"];

    // --- STATE ---
    let time = 0;
    const mouse = { x: width/2, y: height/2 };

    const colors = {
      neutral:   { r: 100, g: 100, b: 120, a: 0.4 },
      voyager:   { r: 255, g: 180, b: 50,  a: 0.8 },
      alchemist: { r: 120, g: 235, b: 255, a: 1.0 }, // Brighter, whiter cyan
    };
    
    let currentColor = { ...colors.neutral };
    let speed = 2;

    class Point {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      noiseOffset: number;
      char: string | null;
      
      constructor(char: string | null = null) {
        this.char = char;
        if (this.char) {
          this.baseX = (Math.random() - 0.5) * width * 0.8; 
          this.z = 300 + Math.random() * 300;
        } else {
          this.baseX = (Math.random() - 0.5) * width * 3;
          this.z = Math.random() * 2000;
        }
        this.x = this.baseX;
        this.y = 0;
        this.noiseOffset = Math.random() * 1000;
      }

      update() {
        if (!this.char) {
            this.z -= speed;
            if (this.z < 1) {
               this.z = 2000;
               this.baseX = (Math.random() - 0.5) * width * 3;
            }
        }

        let targetY = 180;
        
        if (hoveredSide === ViewState.PERSONAL) {
            const drift = Math.sin(time * 0.5 + this.noiseOffset) * 50;
            const float = (2000 - this.z) * 0.1; 
            targetY = 180 - float + drift;
            this.x = this.char ? this.baseX : this.baseX + Math.sin(this.z * 0.002 + time) * 50;
        } else if (hoveredSide === ViewState.PROFESSIONAL) {
            const gridSize = 100;
            this.x = Math.round(this.baseX / gridSize) * gridSize;
            // Moved further down (480) and expanded vertical range (400)
            targetY = 480 + (this.noiseOffset % 400);
        } else {
            const noise = Math.sin(this.baseX * 0.005 + time * 0.5) * Math.cos(this.z * 0.005 + time * 0.5) * 40;
            targetY = 200 + noise;
            this.x = this.baseX;
        }

        const scale = FOV / (FOV + this.z);
        const screenX = width/2 + this.x * scale;
        const screenY = HORIZON_Y + targetY * scale;

        const dx = mouse.x - screenX;
        const dy = mouse.y - screenY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = 250;
        
        if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            targetY += Math.cos(dist * 0.05 - time * 2) * 100 * force;
        }
        this.y = targetY;
      }

      draw() {
        const scale = FOV / (FOV + this.z);
        const screenX = width/2 + this.x * scale;
        const screenY = HORIZON_Y + this.y * scale;

        const alpha = (1 - (this.z / 2000)) * currentColor.a;
        if (alpha <= 0 || (this.z < 10 && !this.char)) return;

        if (hoveredSide === ViewState.PROFESSIONAL) {
            ctx.fillStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`;
            const size = Math.max(1, 4 * scale);
            ctx.fillRect(screenX - size/2, screenY - size/2, size, size);
        } else if (hoveredSide === ViewState.PERSONAL) {
            if (this.char) {
                const breathDriftY = Math.sin(time * 0.4 + this.noiseOffset) * 35;
                const breathDriftX = Math.cos(time * 0.3 + this.noiseOffset) * 20;
                const breathOpacity = (Math.sin(time * 1.5 + this.noiseOffset) * 0.3 + 0.7);
                const finalAlpha = alpha * 0.8 * breathOpacity;
                
                ctx.fillStyle = `rgba(${currentColor.r + 50}, ${currentColor.g + 50}, ${currentColor.b + 50}, ${finalAlpha})`;
                ctx.font = `${Math.max(20, 32 * scale)}px 'Cinzel', serif`;
                ctx.textAlign = "center";
                ctx.shadowBlur = 15;
                ctx.shadowColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${finalAlpha * 0.5})`;
                ctx.fillText(this.char, screenX + breathDriftX, screenY + breathDriftY);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`;
                const size = Math.max(1, 6 * scale);
                ctx.beginPath();
                ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.fillStyle = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`;
            const size = Math.max(1, 3 * scale);
            ctx.beginPath();
            ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            ctx.fill();
        }
      }
    }

    const particles: Point[] = [];
    VOYAGER_CHARS.forEach(char => particles.push(new Point(char)));
    for (let i = 0; i < PARTICLE_COUNT - VOYAGER_CHARS.length; i++) {
        particles.push(new Point());
    }

    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

    const animate = () => {
        let target = colors.neutral;
        let targetSpeed = 2;
        if (hoveredSide === ViewState.PERSONAL) {
            target = colors.voyager;
            targetSpeed = 1; 
        } else if (hoveredSide === ViewState.PROFESSIONAL) {
            target = colors.alchemist;
            targetSpeed = 8;
        }

        currentColor.r = lerp(currentColor.r, target.r, 0.05);
        currentColor.g = lerp(currentColor.g, target.g, 0.05);
        currentColor.b = lerp(currentColor.b, target.b, 0.05);
        currentColor.a = lerp(currentColor.a, target.a, 0.05);
        speed = lerp(speed, targetSpeed, 0.05);

        time += 0.01;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#05020a';
        ctx.fillRect(0, 0, width, height);
        particles.sort((a, b) => b.z - a.z);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    const handleVirtualCursor = (e: Event) => {
        const detail = (e as CustomEvent<{ x: number; y: number }>).detail;
        if (!detail) return;
        mouse.x = detail.x;
        mouse.y = detail.y;
    };
    window.addEventListener('virtual-cursor', handleVirtualCursor as EventListener);

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('virtual-cursor', handleVirtualCursor as EventListener);
        window.removeEventListener('resize', handleResize);
    };
  }, [hoveredSide]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};
