import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomCursorProps {
  externalPosition?: { x: number; y: number } | null;
  useExternal?: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ externalPosition, useExternal }) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    if (useExternal) return;
    let mouseX = -100;
    let mouseY = -100;
    let trailCounter = 0;

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Add trail point - adjusted to a middle ground for length and density
      if (Math.random() > 0.35) { 
          setTrail(prev => [...prev.slice(-30), { x: mouseX, y: mouseY, id: trailCounter++ }]);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [useExternal]);

  useEffect(() => {
    if (!useExternal || !externalPosition) return;
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${externalPosition.x}px, ${externalPosition.y}px, 0)`;
    }
    if (Math.random() > 0.35) {
      setTrail((prev) => [
        ...prev.slice(-30),
        { x: externalPosition.x, y: externalPosition.y, id: Date.now() + Math.random() },
      ]);
    }
  }, [externalPosition, useExternal]);

  return (
    <>
      {/* Main Cursor: The Wand Tip */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[9999] mix-blend-screen"
        style={{ marginTop: -8, marginLeft: -8 }}
      >
        <div className="absolute inset-0 bg-white rounded-full blur-[2px] shadow-[0_0_10px_#fff,0_0_20px_#ffd700]"></div>
        <div className="absolute inset-[-4px] border border-white/50 rounded-full opacity-50 animate-ping"></div>
      </div>

      {/* Magic Dust Trail */}
      {trail.map((point) => (
        <motion.div
            key={point.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="fixed w-1 h-1 bg-amber-200 rounded-full pointer-events-none z-[9998]"
            style={{ 
                left: point.x, 
                top: point.y,
                boxShadow: "0 0 5px #ffd700" 
            }}
        />
      ))}
    </>
  );
};
