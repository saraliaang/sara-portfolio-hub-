
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  CircleDot,
  Clock,
  Code2,
  Compass,
  Globe,
  Hand,
  ShieldCheck,
  Sparkles,
  Telescope,
  X,
} from 'lucide-react';
import { PROJECTS } from '../constants';
import { ActionLayer } from '../actions';

interface ProfessionalGalaxyProps {
  onBack: () => void;
  actions: ActionLayer;
}

const PROJECT_ICON_MAP: Record<string, React.ElementType> = {
  p1: ShieldCheck,
  p2: Clock,
  p3: Sparkles,
  p4: Hand,
  p5: Compass,
};

export const ProfessionalGalaxy: React.FC<ProfessionalGalaxyProps> = ({ onBack, actions }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
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
      setDetailsOpen(true);
    }
    if (actions.confirmFocus.type === 'link') {
      window.open(actions.confirmFocus.url, '_blank', 'noopener,noreferrer');
    }
  }, [actions.confirmId, actions.confirmFocus, projectIndexById, theta]);

  useEffect(() => {
    if (actions.summonId === 0) return;
    setDetailsOpen(true);
  }, [actions.summonId]);

  useEffect(() => {
    if (actions.dismissId === 0) return;
    setDetailsOpen(false);
  }, [actions.dismissId]);

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
  const technicalExecutionItems = activeProject.technicalExecution
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

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

      <div className="relative w-full h-full flex items-center justify-center perspective-[1200px] overflow-visible z-20">
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[820px] sm:w-[1080px] pointer-events-none z-0">
            <img
              src="/assets/pensive.png"
              alt=""
              className="w-full h-auto opacity-90"
            />
            <div className="absolute left-1/2 top-[33%] -translate-x-1/2 w-[60%] h-[26%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.55)_0%,rgba(34,211,238,0.22)_55%,transparent_72%)] blur-[6px]" />
            <div className="absolute left-1/2 top-[31%] -translate-x-1/2 w-[54%] h-[18%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(34,211,238,0.05)_60%,transparent_75%)] blur-[8px] mix-blend-screen" />
            <div className="absolute left-1/2 top-[37%] -translate-x-1/2 w-[62%] h-[12%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] blur-[4px]" />
         </div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
         <div 
            className="relative flex items-center justify-center cursor-grab active:cursor-grabbing z-10 scale-[1.15]"
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
                    rotateX: -9,
                }}
                animate={{ rotateY: rotation }}
                transition={{ type: "spring", stiffness: 18, damping: 28 }}
            >
                {PROJECTS.map((project, index) => {
                    const angle = theta * index;
                    const isActive = selectedIndex === index;
                    const ProjectIcon = PROJECT_ICON_MAP[project.id] ?? Sparkles;
                    const roleLines = project.role.split('·').map((role) => role.trim()).filter(Boolean);
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
                                className={`w-full h-full transition-all duration-500 ${isActive ? 'scale-105 opacity-100' : 'scale-95 opacity-90 hover:opacity-100'}`}
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
                                  setDetailsOpen(true);
                                }}
                            >
                                <div className={`relative w-full h-full backdrop-blur-md border rounded-sm overflow-hidden transition-all duration-500
                                    ${isActive 
                                        ? 'bg-cyan-500/10 border-cyan-300 shadow-[0_0_50px_rgba(34,211,238,0.25),inset_0_0_20px_rgba(34,211,238,0.12)]' 
                                        : 'bg-slate-900/40 border-cyan-300/50 shadow-[0_0_30px_rgba(34,211,238,0.22)]'
                                    }
                                `}>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-200/20 to-transparent h-[200%] w-full animate-scan pointer-events-none"></div>
                                    )}
                                    <div className="p-4 sm:p-8 h-full flex flex-col items-center justify-center text-center relative z-10">
                                        <div className={`mb-4 sm:mb-6 p-2 sm:p-4 rounded-lg border ${isActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-white/5 border-cyan-300/30 text-cyan-200/70'} transition-colors`}>
                                            <ProjectIcon size={window.innerWidth < 768 ? 24 : 32} strokeWidth={1.5} />
                                        </div>
                                        <h3 className={`font-tech text-base sm:text-xl uppercase tracking-wider mb-2 ${isActive ? 'text-white font-bold drop-shadow-md' : 'text-slate-200'}`}>
                                            {project.title}
                                        </h3>
                                        <div className={`w-8 sm:w-12 h-[1px] sm:h-[2px] my-2 sm:my-4 ${isActive ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-white/10'}`}></div>
                                        <div className="space-y-1 text-[8px] sm:text-[10px] text-cyan-200 uppercase tracking-[0.18em] font-semibold">
                                            {roleLines.map((role) => (
                                              <div key={role}>{role}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`absolute top-0 left-0 w-2 h-2 sm:w-3 sm:h-3 border-t sm:border-t-2 border-l sm:border-l-2 ${isActive ? 'border-cyan-300' : 'border-cyan-800'}`}></div>
                                    <div className={`absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:h-3 border-b sm:border-b-2 border-r sm:border-r-2 ${isActive ? 'border-cyan-300' : 'border-cyan-800'}`}></div>
                                </div>
                                <AnimatePresence>
                                  {isActive && (
                                    <motion.div
                                      initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                      exit={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
                                      transition={{ duration: 0.4, ease: 'easeOut' }}
                                      className="absolute left-1/2 -top-20 sm:-top-24 w-[200px] sm:w-[260px] flex flex-col items-start pointer-events-none"
                                    >
                                      <div className="relative">
                                        <div className="w-full px-4 py-2 rounded-md border border-cyan-300/40 bg-cyan-500/10 backdrop-blur-md shadow-[0_0_18px_rgba(34,211,238,0.2)] text-[9px] sm:text-[10px] text-cyan-100 uppercase tracking-[0.24em] whitespace-nowrap text-center">
                                          {project.thesis}
                                        </div>
                                        <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                                          className="absolute left-0 top-full mt-2 w-[120px] h-[36px] pointer-events-none"
                                        >
                                          <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "28px" }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className="absolute left-0 top-0 w-[2px] bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                                          />
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "54px" }}
                                            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                            className="absolute left-0 top-0 h-[2px] bg-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                                          />
                                        </motion.div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                                <div className={`absolute -bottom-8 left-0 right-0 h-16 sm:h-20 bg-gradient-to-b opacity-30 blur-xl transform scale-y-[-1] transition-colors ${isActive ? 'from-cyan-400/40' : 'from-slate-700/20'} to-transparent`}></div>
                            </motion.div>
                        </div>
                    );
                })}
            </motion.div>
         </div>
      </div>

      <AnimatePresence>
        {detailsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[#020617]/50 backdrop-blur-sm"></div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 26 }}
              className="w-[94%] max-w-6xl"
            >
              <div className="relative bg-[#0B1121]/80 border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.15)] backdrop-blur-xl px-8 sm:px-12 py-10 sm:py-12">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_cyan]"></div>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="absolute top-5 right-6 sm:top-6 sm:right-8 text-cyan-200 hover:text-white transition-all pointer-events-auto hover:scale-110"
                  aria-label="Close"
                >
                  <X size={22} strokeWidth={1.5} />
                </button>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col lg:flex-row gap-10 sm:gap-14 items-start"
                  >
                    <div className="w-full lg:w-[35%] flex flex-col gap-7 sm:gap-8">
                      <div className="flex flex-col gap-6">
                        <span className="font-tech text-[10px] sm:text-[11px] text-cyan-300/80 uppercase tracking-[0.4em] font-semibold">
                          {activeProject.thesis}
                        </span>
                        <div>
                          <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.35)] leading-tight">
                            {activeProject.title}
                          </h1>
                          <div className="w-16 sm:w-20 h-px bg-cyan-400 mt-3 shadow-[0_0_10px_cyan]"></div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {activeProject.techStack.map(tech => (
                          <span key={tech} className="px-3 py-1 sm:px-4 sm:py-1.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 text-[11px] sm:text-[13px] font-tech uppercase tracking-wider font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-4 sm:gap-5 mt-2">
                        {activeProject.githubLink && (
                          <a
                            href={activeProject.githubLink}
                            data-focus-type="link"
                            data-focus-url={activeProject.githubLink}
                            onMouseEnter={() => actions.setFocus({ type: 'link', url: activeProject.githubLink as string })}
                            onMouseLeave={() => {
                              if (actions.focus?.type === 'link' && actions.focus.url === activeProject.githubLink) {
                                actions.setFocus(null);
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(activeProject.githubLink, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-cyan-400 text-black font-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-white transition-all rounded-sm shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                          >
                            <Globe size={12} /> Github Code <ArrowUpRight size={12} />
                          </a>
                        )}
                        {activeProject.demoLink && (
                          <a
                            href={activeProject.demoLink}
                            data-focus-type="link"
                            data-focus-url={activeProject.demoLink}
                            onMouseEnter={() => actions.setFocus({ type: 'link', url: activeProject.demoLink as string })}
                            onMouseLeave={() => {
                              if (actions.focus?.type === 'link' && actions.focus.url === activeProject.demoLink) {
                                actions.setFocus(null);
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(activeProject.demoLink, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-transparent border border-cyan-400/40 text-cyan-100 font-tech text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:border-cyan-200 hover:text-white transition-all rounded-sm"
                          >
                            Live Demo <ArrowUpRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="w-full lg:w-[65%] border-l border-cyan-400/60 pl-6 sm:pl-12 py-2 relative bg-gradient-to-r from-cyan-900/10 to-transparent shadow-[-12px_0_24px_rgba(34,211,238,0.12)]">
                      <div className="absolute top-0 left-[-2px] w-[3px] h-10 sm:h-14 bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.8)]"></div>
                      <div className="mb-8 sm:mb-10">
                        <h4 className="flex items-center gap-2 font-tech text-[10px] sm:text-[11px] text-cyan-300 uppercase tracking-[0.3em] mb-3 font-bold">
                          <CircleDot size={12} /> Problem Space
                        </h4>
                        <p className="font-sans text-cyan-50 text-base sm:text-lg leading-relaxed font-light italic">
                          {activeProject.problemSpace}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 sm:gap-8">
                        <div className="flex flex-col gap-6 border border-cyan-300/40 bg-cyan-950/30 p-5 sm:p-6 shadow-[0_0_22px_rgba(34,211,238,0.15)]">
                          <div>
                            <h4 className="flex items-center gap-2 font-tech text-[10px] sm:text-[11px] text-cyan-300 uppercase tracking-[0.3em] mb-3 font-bold">
                              <Sparkles size={12} /> Design Intent
                            </h4>
                            <p className="text-cyan-50 text-sm sm:text-base leading-relaxed">
                              {activeProject.designIntent}
                            </p>
                          </div>
                          <div className="border-t border-cyan-500/20 pt-5">
                            <h4 className="flex items-center gap-2 font-tech text-[10px] sm:text-[11px] text-cyan-300 uppercase tracking-[0.3em] mb-3 font-bold">
                              <Telescope size={12} /> Future Horizon
                            </h4>
                            <p className="text-cyan-50 text-sm sm:text-base leading-relaxed">
                              {activeProject.futureHorizon}
                            </p>
                          </div>
                        </div>
                        <div className="border border-cyan-300/40 bg-cyan-950/30 p-5 sm:p-6 shadow-[0_0_22px_rgba(34,211,238,0.15)]">
                          <h4 className="flex items-center gap-2 font-tech text-[10px] sm:text-[11px] text-cyan-300 uppercase tracking-[0.3em] mb-3 font-bold whitespace-nowrap">
                            <Code2 size={12} /> Technical Execution
                          </h4>
                          <ul className="space-y-3 text-cyan-50 text-sm sm:text-base leading-relaxed">
                            {technicalExecutionItems.map((item) => (
                              <li key={item} className="flex items-start gap-3">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
