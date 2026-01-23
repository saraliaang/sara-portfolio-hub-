
import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowLeft, X, Shuffle, Map as MapIcon, ZoomOut } from 'lucide-react';
import { MEMORIES, STATIC_ELEMENTS, WALKER_PATH } from '../constants';
import { Memory } from '../types';
import { ActionLayer } from '../actions';

interface PersonalGalaxyProps {
  onBack: () => void;
  actions: ActionLayer;
}

// --- INK STROKE UTILS ---
const InkPath = ({ d, width = 1, opacity = 1, className = "" }: { d: string, width?: number, opacity?: number, className?: string }) => (
    <path 
        d={d} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={width} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        opacity={opacity} 
        className={className}
    />
);

// --- MAP ASSETS (REFINED) ---

const CompassRose = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" className="text-[#5c4d44] opacity-40">
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
        <path d="M50,10 L55,40 L85,50 L55,60 L50,90 L45,60 L15,50 L45,40 Z" fill="currentColor" opacity="0.2" />
        <path d="M50,5 L54,35 L90,50 L54,65 L50,95 L46,65 L10,50 L46,35 Z" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <text x="50" y="8" textAnchor="middle" fontSize="8" fontFamily="Cinzel" fill="currentColor">N</text>
    </svg>
);

const Mountains = () => (
    <svg width="60" height="30" viewBox="0 0 60 30" className="text-[#3d312b] opacity-80">
        <InkPath d="M5,30 L15,10 L25,30" width={1} />
        <InkPath d="M20,30 L35,5 L50,30" width={1} />
        <InkPath d="M45,30 L55,15 L60,30" width={1} />
        <InkPath d="M16,12 L18,18" width={0.5} opacity={0.5} />
        <InkPath d="M36,7 L38,15" width={0.5} opacity={0.5} />
    </svg>
);

const Pagoda = ({ active }: { active: boolean }) => (
  <svg width="50" height="60" viewBox="0 0 50 60" className={`text-[#3d312b] overflow-visible transition-all duration-500 ${active ? 'scale-125 drop-shadow-lg' : 'opacity-90'}`}>
     <InkPath d="M10,50 L40,50 L45,45 L5,45 Z" width={1.2} />
     <InkPath d="M10,45 L10,30 M40,45 L40,30" width={1} />
     <InkPath d="M5,30 L45,30 L40,20 L10,20 Z" width={1.2} />
     <InkPath d="M15,20 L15,10 M35,20 L35,10" width={1} />
     <path d="M10,10 L40,10 L25,0 Z" fill={active ? "#8b0000" : "none"} stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

const Bridge = ({ active }: { active: boolean }) => (
  <svg width="70" height="30" viewBox="0 0 70 30" className={`text-[#3d312b] overflow-visible transition-all duration-500 ${active ? 'scale-125 drop-shadow-lg' : 'opacity-90'}`}>
    <path d="M0,30 Q35,-10 70,30" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <InkPath d="M35,5 L35,30" />
    <InkPath d="M18,15 L18,30 M52,15 L52,30" width={0.5} />
    <path d="M0,30 L70,30" stroke="currentColor" strokeWidth="2" strokeDasharray="3 1" />
  </svg>
);

const Tower = ({ active }: { active: boolean }) => (
  <svg width="40" height="70" viewBox="0 0 40 70" className={`text-[#3d312b] overflow-visible transition-all duration-500 ${active ? 'scale-125 drop-shadow-lg' : 'opacity-90'}`}>
    <path d="M10,70 Q20,10 30,70" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <InkPath d="M12,50 L28,50" />
    <InkPath d="M15,30 L25,30" />
    <path d="M20,0 L20,70" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const Skyscraper = ({ active }: { active: boolean }) => (
  <svg width="30" height="80" viewBox="0 0 30 80" className={`text-[#3d312b] overflow-visible transition-all duration-500 ${active ? 'scale-125 drop-shadow-lg' : 'opacity-90'}`}>
    <line x1="15" y1="0" x2="15" y2="15" stroke="currentColor" strokeWidth="1" />
    <path d="M10,22 L15,15 L20,22 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <rect x="7" y="22" width="16" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <rect x="5" y="32" width="20" height="48" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <line x1="10" y1="32" x2="10" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="15" y1="32" x2="15" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <line x1="20" y1="32" x2="20" y2="80" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

const Kraken = () => (
    <svg width="60" height="60" viewBox="0 0 60 60" className="text-[#3d312b] opacity-60">
        <InkPath d="M30,50 Q20,30 5,40" width={1} />
        <InkPath d="M30,50 Q40,30 55,40" width={1} />
        <InkPath d="M30,50 Q25,30 15,20" width={1} />
        <InkPath d="M30,50 Q35,30 45,20" width={1} />
        <InkPath d="M20,55 Q30,50 40,55" width={0.5} opacity={0.5} />
    </svg>
);

const Ship = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" className="text-[#3d312b] opacity-80">
        <path d="M5,30 Q20,40 35,30 L32,25 L8,25 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="20" y1="25" x2="20" y2="5" stroke="currentColor" strokeWidth="1" />
        <path d="M20,8 L32,15 Q25,20 20,22 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
    </svg>
);

const Forest = () => (
    <svg width="40" height="30" viewBox="0 0 40 30" className="text-[#3d312b] opacity-60">
        <InkPath d="M5,25 L10,15 L15,25" />
        <InkPath d="M12,25 L18,10 L24,25" />
        <InkPath d="M22,25 L28,15 L34,25" />
    </svg>
);

const Jungle = () => (
    <svg width="40" height="30" viewBox="0 0 40 30" className="text-[#3d312b] opacity-60">
        <InkPath d="M10,30 Q10,10 5,15" width={0.8} />
        <InkPath d="M20,30 Q20,5 30,15" width={0.8} />
        <InkPath d="M15,30 Q25,20 35,25" width={0.8} />
    </svg>
);

const Dragon = () => (
    <svg width="60" height="40" viewBox="0 0 60 40" className="text-[#8b0000] opacity-50 mix-blend-multiply">
        <InkPath d="M5,30 Q20,10 30,30 T55,30" width={1.2} />
        <InkPath d="M15,20 L18,15 M25,25 L28,20" width={0.5} />
    </svg>
);

const WhaleTail = () => (
    <svg width="50" height="50" viewBox="0 0 100 100" className="text-[#3d312b] opacity-85 overflow-visible">
        <path 
            d="M50,90 
               C42,65 35,45 10,40 
               C0,38 5,20 50,35 
               C95,20 100,38 90,40 
               C65,45 58,65 50,90 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
        />
        <path d="M50,35 L50,45" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M20,95 Q50,88 80,95" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M35,102 Q50,98 65,102" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    </svg>
);

const InkSmudge = ({ active }: { active: boolean }) => (
    <AnimatePresence>
        {active && (
            <motion.div
                initial={{ scale: 0.1, opacity: 0, rotate: -8 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-visible"
            >
                <div className="scale-[2.6] origin-center">
                    <svg width="400" height="300" viewBox="0 0 400 300" className="text-[#3d312b] mix-blend-multiply">
                        <defs>
                            <filter id="inkSmudgeEffect" x="-50%" y="-50%" width="200%" height="200%">
                                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="5" result="noise" />
                                <feDisplacementMap in="SourceGraphic" in2="noise" scale="55" xChannelSelector="R" yChannelSelector="G" result="textured" />
                                <feGaussianBlur in="textured" stdDeviation="4" result="blurred" />
                                <feComponentTransfer in="blurred">
                                    <feFuncA type="linear" slope="0.8" />
                                </feComponentTransfer>
                            </filter>
                        </defs>
                        <g filter="url(#inkSmudgeEffect)">
                            <ellipse cx="200" cy="150" rx="70" ry="30" fill="currentColor" opacity="0.5" />
                            <path
                                d="M140,150 Q170,120 200,150 T260,150"
                                stroke="currentColor"
                                strokeWidth="45"
                                fill="none"
                                strokeLinecap="round"
                                opacity="0.3"
                            />
                            <circle cx="180" cy="140" r="45" fill="currentColor" opacity="0.4" />
                            <circle cx="230" cy="165" r="35" fill="currentColor" opacity="0.3" />
                            <circle cx="120" cy="160" r="8" fill="currentColor" opacity="0.2" />
                            <circle cx="280" cy="140" r="12" fill="currentColor" opacity="0.2" />
                            <circle cx="210" cy="110" r="6" fill="currentColor" opacity="0.2" />
                        </g>
                    </svg>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const TypographyLarge = ({ text }: { text: string }) => (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-[-15deg] whitespace-nowrap">
        <h1 className="font-display text-3xl sm:text-4xl md:text-6xl text-[#5c4d44] tracking-[0.2em]">{text}</h1>
    </div>
);

const TypographyMedium = ({ text }: { text: string }) => (
    <div className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30 whitespace-nowrap">
        <h2 className="font-hand text-xl sm:text-2xl md:text-3xl text-[#5c4d44] tracking-widest">{text}</h2>
    </div>
);

// Map registry
const InteractiveMap: Record<string, any> = {
  'pagoda': Pagoda,
  'skyscraper': Skyscraper,
  'tower': Tower,
  'bridge': Bridge,
};

const StaticMap: Record<string, any> = {
  'mountains': Mountains,
  'kraken': Kraken,
  'ship': Ship,
  'forest': Forest,
  'jungle': Jungle,
  'dragon': Dragon,
  'compass_rose': CompassRose,
  'pyramid': Mountains, 
  'village': Forest, 
  'island': Mountains,
  'opera': () => <svg width="40" height="20" viewBox="0 0 40 20" className="text-[#3d312b]"><path d="M0,20 Q10,0 20,20 Q30,5 40,20" fill="none" stroke="currentColor"/></svg>,
  'whale': () => <svg width="30" height="20" viewBox="0 0 30 20" className="text-[#3d312b] opacity-50"><path d="M0,10 Q15,0 30,15" fill="none" stroke="currentColor"/></svg>,
  'whale_tail': WhaleTail,
  'text_large': ({ label }: any) => <TypographyLarge text={label} />,
  'text_medium': ({ label }: any) => <TypographyMedium text={label} />,
  'text_small': ({ label }: any) => <span className="font-tech text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-[#5c4d44] opacity-50">{label}</span>
};

// --- REALISTIC FOOTSTEPS ENGINE ---

const Footstep = ({ x, y, rotation, isLeft, onComplete }: { x: number, y: number, rotation: number, isLeft: boolean, onComplete: () => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: 4.5, times: [0, 0.1, 0.7, 1] }} 
            onAnimationComplete={onComplete}
            className="absolute pointer-events-none z-10"
            style={{ 
                left: `${x}%`, 
                top: `${y}%`, 
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(0.4)`,
                color: '#3e2723' 
            }}
        >
             <svg width="30" height="50" viewBox="0 0 30 50" fill="currentColor" className="mix-blend-multiply opacity-80">
                 <path d={isLeft 
                    ? "M10,2 C4,2 0,10 2,25 C3,32 10,35 15,35 C20,35 24,30 22,15 C20,5 15,2 10,2 Z" 
                    : "M20,2 C26,2 30,10 28,25 C27,32 20,35 15,35 C10,35 6,30 8,15 C10,5 15,2 20,2 Z"} 
                 />
                 <path d={isLeft
                    ? "M8,38 C4,38 4,46 8,48 C12,48 14,46 14,40 C14,38 10,38 8,38 Z"
                    : "M22,38 C26,38 26,46 22,48 C18,48 16,46 16,40 C16,38 20,38 22,38 Z"}
                 />
             </svg>
        </motion.div>
    );
};

const FootstepsManager = () => {
    const [steps, setSteps] = useState<{id: number, x: number, y: number, rotation: number, isLeft: boolean}[]>([]);
    
    useEffect(() => {
        let stepCount = 0;
        let currentWpIdx = 0;
        let progress = 0;
        let currentPos = { ...WALKER_PATH[0] }; 
        
        const interval = setInterval(() => {
            const p1 = WALKER_PATH[currentWpIdx];
            const p2 = WALKER_PATH[(currentWpIdx + 1) % WALKER_PATH.length];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            progress += 2.0; 
            
            if (progress >= dist) {
                progress = 0;
                currentWpIdx = (currentWpIdx + 1) % WALKER_PATH.length;
                currentPos = { ...p2 };
            } else {
                const ratio = progress / dist;
                const curX = p1.x + dx * ratio;
                const curY = p1.y + dy * ratio;
                const angle = Math.atan2(dy, dx);
                const degrees = (angle * 180 / Math.PI) + 90;
                stepCount++;
                const isLeft = stepCount % 2 === 0;
                const stepWidth = 1.5; 
                const perpAngle = angle + (isLeft ? -Math.PI/2 : Math.PI/2);
                const perpX = Math.cos(perpAngle) * (stepWidth * 0.5); 
                const perpY = Math.sin(perpAngle) * (stepWidth * 0.5);
                const finalX = curX + perpX;
                const finalY = curY + perpY;

                setSteps(prev => [...prev, { 
                    id: Date.now() + Math.random(), 
                    x: finalX, 
                    y: finalY, 
                    rotation: degrees,
                    isLeft 
                }]);
            }
        }, 600); 

        return () => clearInterval(interval);
    }, []);

    const removeStep = (id: number) => {
        setSteps(prev => prev.filter(s => s.id !== id));
    };

    return (
        <>
            {steps.map(s => (
                <Footstep 
                    key={s.id} 
                    {...s} 
                    onComplete={() => removeStep(s.id)}
                />
            ))}
        </>
    );
};

const WorldMapBackground = () => (
    <div className="absolute inset-[-20%] w-[140%] h-[140%] pointer-events-none opacity-20 z-0">
        <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="none">
             <defs>
                 <filter id="ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
                     <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" result="noise" />
                     <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
                 </filter>
             </defs>
             <g filter="url(#ink-bleed)" fill="#dcd3c3" stroke="#bcaaa4" strokeWidth="0.5">
                 <path d="M10,10 L35,10 Q40,30 30,50 L35,80 L20,90 L5,30 Z" />
                 <path d="M25,60 L45,60 L40,100 L25,90 Z" />
                 <path d="M50,15 L160,15 L170,40 L150,50 L120,80 L80,70 L60,40 L50,30 Z" />
                 <path d="M50,40 L80,40 L85,80 L60,90 L45,50 Z" />
                 <path d="M130,80 L160,75 L165,100 L135,105 Z" />
             </g>
             <g stroke="#8c7b70" strokeWidth="0.1" strokeDasharray="2 2" opacity="0.5">
                 <line x1="0" y1="30" x2="200" y2="30" />
                 <line x1="0" y1="60" x2="200" y2="60" />
                 <line x1="0" y1="90" x2="200" y2="90" />
                 <line x1="40" y1="0" x2="40" y2="120" />
                 <line x1="80" y1="0" x2="80" y2="120" />
                 <line x1="120" y1="0" x2="120" y2="120" />
                 <line x1="160" y1="0" x2="160" y2="120" />
             </g>
        </svg>
    </div>
);

// --- WHISPER SUB-COMPONENT ---
const MagicWhisper = () => {
    const whisperText = "I solemnly swear that I am up to something meaningful.";
    const words = whisperText.split(" ");
    const [cycle, setCycle] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCycle(prev => prev + 1);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.45,
                delayChildren: 0.8
            }
        },
        exit: {
            opacity: 0,
            filter: "blur(8px)",
            scale: 1.05,
            transition: { duration: 1.5, ease: "easeInOut" }
        }
    };

    const wordVariants: Variants = {
        hidden: { opacity: 0, y: 8 },
        visible: {
            opacity: 0.4,
            y: 0,
            transition: { duration: 1.5 }
        }
    };

    return (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-8 -translate-y-6 pointer-events-none z-10">
            <AnimatePresence mode="wait">
                {cycle % 2 === 0 && (
                    <motion.div
                        key={cycle}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative flex flex-wrap gap-x-4 gap-y-1 max-w-[85vw]"
                    >
                        {words.map((word, i) => (
                            <motion.span
                                key={i}
                                variants={wordVariants}
                                className="font-['Tangerine'] font-semibold text-lg sm:text-2xl md:text-4xl text-[#3d312b] italic leading-tight"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const PersonalGalaxy: React.FC<PersonalGalaxyProps> = ({ onBack, actions }) => {
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [hoveredMemoryId, setHoveredMemoryId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (activeMemory) {
        setOffset({
            x: 25 - activeMemory.coordinates.x,
            y: 50 - activeMemory.coordinates.y
        });
    } else {
        setOffset({ x: 0, y: 0 });
    }
  }, [activeMemory]);

  const handleSummon = useCallback(() => {
      const currentIndex = activeMemory ? MEMORIES.findIndex(m => m.id === activeMemory.id) : -1;
      const nextIndex = (currentIndex + 1) % MEMORIES.length;
      setActiveMemory(MEMORIES[nextIndex]);
  }, [activeMemory]);

  const closeMemory = useCallback(() => setActiveMemory(null), []);

  useEffect(() => {
      if (actions.confirmId === 0) return;
      if (!actions.confirmFocus) return;
      if (actions.confirmFocus.type === 'place') {
          const nextMemory = MEMORIES.find((mem) => mem.id === actions.confirmFocus.id);
          if (nextMemory) {
              setActiveMemory(nextMemory);
          }
      }
  }, [actions.confirmId, actions.confirmFocus]);

  useEffect(() => {
      if (actions.summonId === 0) return;
      handleSummon();
  }, [actions.summonId, handleSummon]);

  useEffect(() => {
      if (actions.dismissId === 0) return;
      closeMemory();
  }, [actions.dismissId, closeMemory]);

  useEffect(() => {
      if (actions.focus?.type === 'place') {
          setHoveredMemoryId(actions.focus.id);
          return;
      }
      if (!actions.focus || actions.focus.type !== 'place') {
          setHoveredMemoryId(null);
      }
  }, [actions.focus]);

  return (
    <div className="relative w-full h-full bg-[#e8dfcf] overflow-hidden text-[#3d312b] font-serif">
      
      {/* 1. TEXTURE BASE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[#e8dfcf]"></div>
         <div className="absolute inset-0 opacity-[0.4] bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(61,49,43,0.3)_100%)]"></div>
      </div>

      {/* 2. THE SCROLLABLE MAP */}
      <motion.div 
        className="absolute w-full h-full origin-center will-change-transform cursor-grab active:cursor-grabbing"
        animate={{ 
            x: `${offset.x}%`, 
            y: `${offset.y}%`,
            scale: activeMemory ? 1.4 : 1 
        }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
        onClick={closeMemory}
      >
          <WorldMapBackground />
          <MagicWhisper />
          <FootstepsManager />

          {STATIC_ELEMENTS.map((el) => {
              const Comp = StaticMap[el.type] || StaticMap.mountains;
              if (el.type.startsWith('text')) {
                   return (
                       <div key={el.id} className="absolute" style={{ left: `${el.x}%`, top: `${el.y}%` }}>
                           <Comp label={el.label} />
                       </div>
                   )
              }
              return (
                  <div key={el.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ left: `${el.x}%`, top: `${el.y}%` }}>
                      <Comp />
                      {el.label && !el.type.startsWith('text') && (
                          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 font-hand text-[8px] sm:text-[10px] text-[#8c7b70] whitespace-nowrap opacity-70">
                              {el.label}
                          </span>
                      )}
                  </div>
              );
          })}

          {MEMORIES.map((mem) => {
              const BuildingComponent = InteractiveMap[mem.icon] || InteractiveMap.tower;
              const isActive = activeMemory?.id === mem.id;
              const isHovered = hoveredMemoryId === mem.id;
              return (
                  <div 
                    key={mem.id}
                    className="absolute z-20 group cursor-pointer"
                    data-focus-type="place"
                    data-focus-id={mem.id}
                    style={{ left: `${mem.coordinates.x}%`, top: `${mem.coordinates.y}%`, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => {
                        setHoveredMemoryId(mem.id);
                        actions.setFocus({ type: 'place', id: mem.id });
                    }}
                    onMouseLeave={() => {
                        setHoveredMemoryId(null);
                        if (actions.focus?.type === 'place' && actions.focus.id === mem.id) {
                            actions.setFocus(null);
                        }
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        actions.setFocus({ type: 'place', id: mem.id });
                        actions.confirm();
                        setActiveMemory(mem);
                    }}
                  >
                      <InkSmudge active={isActive} />
                      <div className={`absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${isActive || isHovered ? 'scale-110' : 'group-hover:scale-110'}`}>
                          <div className={`bg-[#e8dfcf] border px-1.5 py-0.5 shadow-sm transition-colors duration-300 ${isActive || isHovered ? 'border-[#8b0000]' : 'border-[#5c4d44]'}`}>
                              <span className={`font-display text-[8px] md:text-xs font-bold tracking-widest ${isActive || isHovered ? 'text-[#8b0000]' : 'text-[#5c4d44]'}`}>
                                  {mem.location}
                              </span>
                          </div>
                          <div className={`w-0.5 h-3 md:h-4 transition-colors duration-300 ${isActive || isHovered ? 'bg-[#8b0000]' : 'bg-[#5c4d44]'}`}></div>
                      </div>
                      <BuildingComponent active={isActive} />
                      {isHovered && !isActive && (
                        <div className="absolute inset-[-18px] md:inset-[-28px] border border-[#8b0000] rounded-full opacity-30 blur-[2px] pointer-events-none"></div>
                      )}
                  </div>
              );
          })}
      </motion.div>

      {/* 3. OVERLAY UI */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8 z-50">
        <button 
            onMouseEnter={() => actions.setFocus({ type: 'back' })}
            onMouseLeave={() => {
                if (actions.focus?.type === 'back') {
                    actions.setFocus(null);
                }
            }}
            onClick={() => {
                actions.setFocus({ type: 'back' });
                actions.confirm();
                onBack();
            }}
            data-focus-type="back"
            className="flex items-center gap-2 sm:gap-3 text-[#5c4d44] hover:text-[#2a221e] group transition-colors"
        >
            <div className="p-1.5 sm:p-2 border border-[#8c7b70] rounded-full group-hover:bg-[#3d312b] group-hover:text-[#e8e0d5] transition-all bg-[#e8dfcf] shadow-sm">
                <ArrowLeft size={16} />
            </div>
            <span className="font-display font-bold tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs uppercase drop-shadow-md bg-[#e8dfcf]/60 backdrop-blur-sm px-2 rounded-sm">Exit Map</span>
        </button>
      </div>

      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 z-50 flex gap-2 sm:gap-4">
        {activeMemory && (
            <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={closeMemory}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#8b0000] text-[#e8dfcf] font-display text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:bg-[#5c4d44] transition-all rounded-sm shadow-md"
            >
                <ZoomOut size={12} /> Close
            </motion.button>
        )}
        <button 
            onClick={handleSummon}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-[#5c4d44] bg-[#e8dfcf] text-[#5c4d44] font-display text-[10px] sm:text-xs font-bold tracking-widest uppercase hover:bg-[#3d312b] hover:text-[#e8dfcf] transition-all shadow-[2px_2px_0px_#5c4d44] sm:shadow-[4px_4px_0px_#5c4d44] hover:shadow-[1px_1px_0px_#5c4d44] active:translate-y-[2px] active:shadow-none"
        >
            <Shuffle size={12} /> Jump
        </button>
      </div>

      {/* 4. SIDEBAR DETAIL (Journal) */}
      <AnimatePresence>
        {activeMemory && (
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 w-full sm:w-[450px] h-full bg-[#f2ebd9] shadow-[-20px_0_50px_rgba(61,49,43,0.2)] z-40 flex flex-col border-l-2 border-[#5c4d44]"
            >
                <div className="h-14 sm:h-16 bg-[#5c4d44] flex items-center justify-between px-6 text-[#e8dfcf]">
                    <span className="font-display tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs uppercase">Journal Entry</span>
                    <button onClick={closeMemory} className="hover:text-white transition-colors"><X size={20}/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10 relative custom-scrollbar">
                    <div className="inline-block border border-[#8b0000] text-[#8b0000] px-2 py-0.5 sm:py-1 font-tech text-[8px] sm:text-[10px] uppercase tracking-widest mb-4 sm:mb-6">
                        {activeMemory.date}
                    </div>

                    <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[#2a221e] mb-3 sm:mb-4 leading-none">
                        {activeMemory.title}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-6 sm:mb-8 opacity-70">
                         <MapIcon size={12} />
                         <span className="font-hand text-base sm:text-lg">{activeMemory.location}</span>
                    </div>

                    <p className="font-serif text-base sm:text-lg text-[#4a3b32] leading-relaxed mb-8 sm:mb-10 first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-display first-letter:float-left first-letter:mr-3 first-letter:mt-[-5px] sm:first-letter:mt-[-10px]">
                        {activeMemory.description}
                    </p>

                    <div className="p-4 sm:p-6 bg-[#e8dfcf] border border-[#d6cbb5] rounded-sm">
                        <span className="block font-display text-[8px] sm:text-[10px] uppercase tracking-widest text-[#8c7b70] mb-2">Primary Emotion</span>
                        <span className="font-hand text-xl sm:text-2xl text-[#8b0000]">{activeMemory.emotion}</span>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
