
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Globe, Database, Activity, Layers, ScanLine } from 'lucide-react';
import { PROJECTS } from '../constants';
import { ActionLayer } from '../actions';

interface ProfessionalGalaxyProps {
  onBack: () => void;
  actions: ActionLayer;
}

export const ProfessionalGalaxy: React.FC<ProfessionalGalaxyProps> = ({ onBack, actions }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentRotation = useRef(0);
  
  const radius = window.innerWidth < 768 ? 300 : 500; 
  const cardWidth = window.innerWidth < 768 ? 200 : 260;
  const count = PROJECTS.length;
  const theta = 360 / count;
  const projectIndexById = useMemo(() => new Map(PROJECTS.map((p, idx) => [p.id, idx])), []);
  const getClosestRotation = (current: number, target: number) => {
    const diff = ((target - current + 540) % 360) - 180;
    return current + diff;
  };

  useEffect(() => {
    const snapIndex = Math.round(rotation / -theta);
    const normalizedIndex = ((snapIndex % count) + count) % count;
    setSelectedIndex(normalizedIndex);
  }, [rotation, count, theta]);

  useEffect(() => {
    if (actions.confirmId === 0) return;
    if (!actions.confirmFocus) return;
    if (actions.confirmFocus.type === 'project') {
      const nextIndex = projectIndexById.get(actions.confirmFocus.id);
      if (typeof nextIndex === 'number') {
        setRotation((prev) => getClosestRotation(prev, nextIndex * -theta));
      }
    }
    if (actions.confirmFocus.type === 'link') {
      window.open(actions.confirmFocus.url, '_blank', 'noopener,noreferrer');
    }
  }, [actions.confirmId, actions.confirmFocus, projectIndexById, theta]);

  useEffect(() => {
    if (actions.scrollSignal.id === 0) return;
    if (!actions.scrollSignal.delta) return;
    setRotation((prev) => prev - actions.scrollSignal.delta * 15);
  }, [actions.scrollSignal]);

  useEffect(() => {
    if (actions.focus?.type !== 'project') return;
    if (isDragging) return;
    const nextIndex = projectIndexById.get(actions.focus.id);
    if (typeof nextIndex === 'number') {
      setRotation((prev) => getClosestRotation(prev, nextIndex * -theta));
    }
  }, [actions.focus, isDragging, projectIndexById, theta]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    startX.current = clientX;
    currentRotation.current = rotation;
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = clientX - startX.current;
    setRotation(currentRotation.current + (diff * 0.4));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const snapIndex = Math.round(rotation / -theta);
    setRotation(snapIndex * -theta);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const rawDelta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
    const clamped = Math.max(-25, Math.min(25, rawDelta));
    setRotation((prev) => prev - clamped * 0.008);
  };

  const activeProject = PROJECTS[selectedIndex];

  return (
    <div 
        className="relative w-full h-full flex flex-col overflow-hidden bg-[#0B1121] text-cyan-50 select-none"
        onWheel={handleWheel}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-[#0B1121] to-[#020617] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none perspective-[1000px] transform rotate-x-60"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-cyan-400/10 blur-[100px] pointer-events-none rounded-full mix-blend-screen"></div>

      <div className="absolute top-0 left-0 w-full p-4 sm:p-8 z-50 flex justify-between items-start pointer-events-none">
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
          className="pointer-events-auto group flex items-center gap-2 sm:gap-3 text-cyan-300 hover:text-white transition-colors"
        >
          <div className="p-1.5 sm:p-2 rounded-sm border border-cyan-400/30 group-hover:border-cyan-200 group-hover:bg-cyan-500/20 transition-all bg-cyan-900/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ArrowLeft size={14} />
          </div>
          <span className="font-tech text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] uppercase font-bold text-shadow-cyan">System_Exit</span>
        </button>

        <div className="font-tech text-[8px] sm:text-[10px] text-cyan-300/60 uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
             <span className="hidden sm:inline">Sector: Professional // </span>{rotation.toFixed(0)}°
        </div>
      </div>

      <div className="relative w-full h-[45%] md:h-[50%] flex items-center justify-center perspective-[1200px] overflow-visible z-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
         <div 
            className="relative flex items-center justify-center cursor-grab active:cursor-grabbing z-10 top-6 sm:top-10"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ width: '100%', height: '100%' }}
         >
            <motion.div 
                className="relative"
                style={{ 
                    transformStyle: "preserve-3d",
                    translateZ: -radius,
                    rotateX: 5,
                }}
                animate={{ rotateY: rotation }}
                transition={{ type: "spring", stiffness: 18, damping: 28 }}
            >
                {PROJECTS.map((project, index) => {
                    const angle = theta * index;
                    const isActive = selectedIndex === index;
                    return (
                        <div
                            key={project.id}
                            className="absolute top-1/2 left-1/2"
                            style={{
                                width: cardWidth,
                                height: cardWidth * 1.4,
                                marginLeft: -cardWidth / 2,
                                marginTop: -(cardWidth * 1.4) / 2,
                                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                transformStyle: "preserve-3d",
                            }}
                        >
                            <motion.div 
                                className={`w-full h-full transition-all duration-500 ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-20 grayscale-[0.8] hover:opacity-40'}`}
                                data-focus-type="project"
                                data-focus-id={project.id}
                                onMouseEnter={() => {
                                  actions.setFocus({ type: 'project', id: project.id });
                                  if (!isDragging && index !== selectedIndex) {
                                    setRotation((prev) => getClosestRotation(prev, index * -theta));
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (actions.focus?.type === 'project' && actions.focus.id === project.id) {
                                    actions.setFocus(null);
                                  }
                                }}
                                onClick={() => {
                                  actions.setFocus({ type: 'project', id: project.id });
                                  actions.confirm();
                                }}
                            >
                                <div className={`relative w-full h-full backdrop-blur-md border rounded-sm overflow-hidden transition-all duration-500
                                    ${isActive 
                                        ? 'bg-cyan-500/10 border-cyan-300 shadow-[0_0_50px_rgba(34,211,238,0.25),inset_0_0_20px_rgba(34,211,238,0.1)]' 
                                        : 'bg-slate-900/40 border-cyan-500/20'
                                    }
                                `}>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-200/20 to-transparent h-[200%] w-full animate-scan pointer-events-none"></div>
                                    )}
                                    <div className="p-4 sm:p-8 h-full flex flex-col items-center justify-center text-center relative z-10">
                                        <div className={`mb-4 sm:mb-6 p-2 sm:p-4 rounded-lg border ${isActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-white/5 border-white/10 text-slate-400'} transition-colors`}>
                                            <Layers size={window.innerWidth < 768 ? 24 : 32} strokeWidth={1.5} />
                                        </div>
                                        <h3 className={`font-tech text-lg sm:text-2xl uppercase tracking-wider mb-2 ${isActive ? 'text-white font-bold drop-shadow-md' : 'text-slate-300'}`}>
                                            {project.title}
                                        </h3>
                                        <div className={`w-8 sm:w-12 h-[1px] sm:h-[2px] my-2 sm:my-4 ${isActive ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-white/10'}`}></div>
                                        <span className="font-tech text-[8px] sm:text-[10px] text-cyan-200 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-semibold">
                                            {project.role}
                                        </span>
                                    </div>
                                    <div className={`absolute top-0 left-0 w-2 h-2 sm:w-3 sm:h-3 border-t sm:border-t-2 border-l sm:border-l-2 ${isActive ? 'border-cyan-300' : 'border-cyan-800'}`}></div>
                                    <div className={`absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 border-b sm:border-b-2 border-r sm:border-r-2 ${isActive ? 'border-cyan-300' : 'border-cyan-800'}`}></div>
                                </div>
                                <div className={`absolute -bottom-8 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b opacity-30 blur-xl transform scale-y-[-1] transition-colors ${isActive ? 'from-cyan-400/40' : 'from-slate-700/20'} to-transparent`}></div>
                            </motion.div>
                        </div>
                    );
                })}
            </motion.div>
         </div>
      </div>

      <div className="relative flex-1 w-full z-30 flex flex-col justify-center overflow-y-auto sm:overflow-hidden px-4 py-8">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_cyan]"></div>

         <div className="max-w-5xl mx-auto w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row gap-8 sm:gap-16 items-start"
                >
                    <div className="w-full md:flex-1 md:max-w-md">
                        <div className="flex flex-col mb-4 sm:mb-6">
                            <span className="font-tech text-[8px] sm:text-[10px] text-cyan-400 uppercase tracking-[0.3em] sm:tracking-[0.5em] mb-2 font-bold">
                                Transmuting logic into experience
                            </span>
                            <div className="relative inline-block">
                                <h1 className="text-3xl sm:text-5xl md:text-7xl font-sans font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] leading-tight">
                                    {activeProject.title}
                                </h1>
                                <div className="w-16 sm:w-24 h-px bg-cyan-400 mt-2 shadow-[0_0_10px_cyan]"></div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                            {activeProject.techStack.map(tech => (
                                <span key={tech} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 text-[8px] sm:text-[10px] font-tech uppercase tracking-wider font-bold">
                                    {tech}
                                </span>
                            ))}
                        </div>
                        
                        <motion.a 
                            href={activeProject.link}
                            data-focus-type="link"
                            data-focus-url={activeProject.link}
                            onMouseEnter={() => actions.setFocus({ type: 'link', url: activeProject.link })}
                            onMouseLeave={() => {
                              if (actions.focus?.type === 'link' && actions.focus.url === activeProject.link) {
                                actions.setFocus(null);
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              actions.setFocus({ type: 'link', url: activeProject.link });
                              actions.confirm();
                            }}
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-2 sm:gap-3 px-6 py-2 sm:px-8 sm:py-3 bg-cyan-400 text-black font-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-white transition-all rounded-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        >
                            <Globe size={12} /> Initialize <ArrowUpRight size={12} />
                        </motion.a>
                    </div>

                    <div className="w-full md:flex-1 border-l border-cyan-500/30 pl-4 sm:pl-12 py-2 relative bg-gradient-to-r from-cyan-900/10 to-transparent">
                        <div className="absolute top-0 left-[-1px] w-[2px] h-8 sm:h-12 bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
                        <div className="mb-6 sm:mb-8">
                            <h4 className="flex items-center gap-2 font-tech text-[8px] sm:text-[10px] text-cyan-400 uppercase tracking-widest mb-3 font-bold">
                                <ScanLine size={12} /> System Description
                            </h4>
                            <p className="font-sans text-cyan-50 text-base sm:text-xl leading-relaxed font-light">
                                {activeProject.description}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                            <div>
                                <h4 className="flex items-center gap-2 font-tech text-[8px] sm:text-[10px] text-cyan-400 uppercase tracking-widest mb-2 font-bold">
                                    <Activity size={12} /> Impact
                                </h4>
                                <p className="font-tech text-xs sm:text-sm text-cyan-100">{activeProject.impact}</p>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 font-tech text-[8px] sm:text-[10px] text-cyan-400 uppercase tracking-widest mb-2 font-bold">
                                    <Database size={12} /> Type
                                </h4>
                                <p className="font-tech text-xs sm:text-sm text-cyan-100">Distributed Architecture</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};
