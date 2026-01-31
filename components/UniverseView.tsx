
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ViewState } from '../types';
import { LandingBackground } from './LandingBackground';
import { Compass, Github, Linkedin, Mail } from 'lucide-react';
import { ActionLayer } from '../actions';

interface UniverseViewProps {
  onSelect: (view: ViewState) => void;
  actions: ActionLayer;
  guideOpen: boolean;
  onGuideToggle: (next: boolean) => void;
  gestureEnabled: boolean;
}

export const UniverseView: React.FC<UniverseViewProps> = ({
  onSelect,
  actions,
  guideOpen,
  onGuideToggle,
  gestureEnabled,
}) => {
  const [hoveredSide, setHoveredSide] = useState<ViewState | null>(null);

  const whoText = "Who?".split("");
  const subtitleText = "Transmuting logic into experience";
  const isBelowHoverBoundary = (y: number) => y >= window.innerHeight * 0.35;

  useEffect(() => {
    if (!gestureEnabled) return;
    if (actions.focus?.type === 'world') {
      setHoveredSide(actions.focus.id);
      return;
    }
    if (!actions.focus) {
      setHoveredSide(null);
    }
  }, [actions.focus, gestureEnabled]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-center items-center">
      
      {/* 1. DYNAMIC BACKGROUND */}
      <LandingBackground hoveredSide={hoveredSide} />

      {/* 2. TITLE LAYER */}
      <div className="absolute top-8 md:top-16 w-full text-center z-20 mix-blend-screen text-white px-4 pointer-events-none">
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col items-center"
        >
            <div className="mb-2 md:mb-4">
                <span className="font-tech text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/30">The Identity Protocol</span>
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center md:items-end justify-center">
                <h1 className="font-display font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] tracking-tighter text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-10 select-none leading-none">
                    Sara
                </h1>
                
                <div className="font-hand text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[9rem] text-amber-300/90 md:ml-6 pb-2 flex z-20 pointer-events-none leading-none mt-[-10px] md:mt-0">
                    {whoText.map((char, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
                            animate={{ 
                                opacity: 1, 
                                x: 0, 
                                filter: 'blur(0px)',
                                y: [0, -10, 0],
                                textShadow: [
                                    "0 0 15px rgba(251,191,36,0.4)", 
                                    "0 0_35px rgba(251,191,36,0.8)", 
                                    "0 0 15px rgba(251,191,36,0.4)"
                                ]
                            }}
                            transition={{ 
                                duration: 1, 
                                delay: 1.2 + (i * 0.15), 
                                ease: [0.22, 1, 0.36, 1],
                                y: {
                                    repeat: Infinity,
                                    duration: 3 + (i * 0.2),
                                    ease: "easeInOut",
                                    delay: 2.2 + (i * 0.15)
                                },
                                textShadow: {
                                    repeat: Infinity,
                                    duration: 2.5 + (i * 0.3),
                                    ease: "easeInOut",
                                    delay: 2.2 + (i * 0.15)
                                }
                            }}
                            className="inline-block"
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </div>

                <div className="pointer-events-auto mt-4 md:mt-0 md:absolute md:left-full md:ml-24 lg:ml-32 hidden">
                    <motion.button
                        data-focus-type="guide"
                        onMouseEnter={() => actions.setFocus({ type: 'guide' })}
                        onMouseLeave={() => {
                            if (actions.focus?.type === 'guide') actions.setFocus(null);
                        }}
                        onClick={() => {
                            actions.setFocus({ type: 'guide' });
                            actions.confirm();
                            onGuideToggle(!guideOpen);
                        }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="relative inline-flex items-center justify-center gap-3 px-9 py-3 rounded-full text-amber-100 font-tech text-base sm:text-lg uppercase tracking-[0.5em] bg-black/30 backdrop-blur-sm shadow-[0_0_45px_rgba(251,191,36,0.35)]"
                    >
                        <span className="relative z-10">Charm Guild</span>
                        <motion.span
                            className="absolute inset-0 rounded-full border border-amber-200/40"
                            animate={{ opacity: [0.4, 0.9, 0.4] }}
                            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.span
                            className="absolute inset-[-10px] rounded-full border border-amber-200/20"
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.span
                            className="absolute inset-[-20px] rounded-full border border-amber-200/10 blur-[1px]"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.button>
                </div>
            </div>

            
            <div className="relative mt-6 md:mt-12 flex flex-col items-center hidden sm:flex">
                <div className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
                <div className="w-1 h-1 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
        </motion.div>
      </div>

      {/* 3. INTERACTION ZONES */}
      <div className="relative w-full h-[70vh] md:h-[60vh] z-10 flex flex-col md:flex-row mt-16 md:mt-8">
         {/* LEFT: VOYAGER */}
         <motion.div 
            className="relative flex-1 group cursor-pointer md:border-r border-white/5"
            data-focus-type="world"
            data-focus-id={ViewState.PERSONAL}
            onMouseMove={(e) => {
                if (isBelowHoverBoundary(e.clientY)) {
                    setHoveredSide(ViewState.PERSONAL);
                    actions.setFocus({ type: 'world', id: ViewState.PERSONAL });
                } else {
                    setHoveredSide(null);
                    if (actions.focus?.type === 'world' && actions.focus.id === ViewState.PERSONAL) {
                        actions.setFocus(null);
                    }
                }
            }}
            onMouseLeave={() => {
                setHoveredSide(null);
                if (actions.focus?.type === 'world' && actions.focus.id === ViewState.PERSONAL) {
                    actions.setFocus(null);
                }
            }}
            onClick={() => {
                actions.setFocus({ type: 'world', id: ViewState.PERSONAL });
                actions.confirm();
                onSelect(ViewState.PERSONAL);
            }}
         >
            <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-8">
                {/* Minimized by 10%: scale-[0.5]->[0.45], sm:scale-[0.6]->[0.54], lg:scale-[0.75]->[0.675] */}
                <div className={`flex flex-col items-center w-full max-w-2xl transition-transform duration-700 ${hoveredSide === ViewState.PERSONAL ? '-translate-y-4' : ''} scale-[0.45] sm:scale-[0.54] lg:scale-[0.675] origin-center`}>
                    <motion.div 
                        animate={{ 
                            borderColor: hoveredSide === ViewState.PERSONAL ? 'rgba(251,191,36,0.6)' : 'rgba(251,191,36,0.15)',
                            opacity: hoveredSide === ViewState.PERSONAL ? 1 : 0.6
                        }}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-[1.2px] border-amber-500/20 flex items-center justify-center mb-12 md:mb-16 transition-all duration-700"
                    >
                        <Compass className={`w-12 h-12 md:w-16 md:h-16 transition-colors duration-700 ${hoveredSide === ViewState.PERSONAL ? 'text-amber-200' : 'text-amber-100/40'}`} strokeWidth={0.5} />
                    </motion.div>
                    <h2 className={`font-serif-classic font-semibold text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] xl:text-[8rem] tracking-[0.2em] md:tracking-[0.38em] uppercase transition-all duration-1000 whitespace-nowrap ${hoveredSide === ViewState.PERSONAL ? 'text-[#ffdb8b] drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]' : 'text-amber-50/40'}`}>
                        THE VOYAGER
                    </h2>
                    <motion.p 
                        animate={{ opacity: hoveredSide === ViewState.PERSONAL ? 0.9 : 0.3 }}
                        className={`font-hand text-3xl sm:text-5xl md:text-6xl mt-8 md:mt-12 transition-all duration-1000 text-center ${hoveredSide === ViewState.PERSONAL ? 'text-amber-100' : 'text-amber-100/40'}`}
                    >
                        "Finding meaning in the journey."
                    </motion.p>
                    
                    <motion.div 
                        animate={{ opacity: hoveredSide === ViewState.PERSONAL ? 0.8 : 0.2 }}
                        className={`flex items-center gap-4 sm:gap-8 mt-6 md:mt-10 font-serif-classic text-xs sm:text-sm tracking-[0.4em] uppercase transition-all duration-1000 ${hoveredSide === ViewState.PERSONAL ? 'text-amber-200/90' : 'text-amber-100/20'}`}
                    >
                        <span>Origins</span>
                        <span className="w-1.5 h-1.5 bg-current rounded-full opacity-40"></span>
                        <span>Values</span>
                        <span className="w-1.5 h-1.5 bg-current rounded-full opacity-40"></span>
                        <span>Stories</span>
                    </motion.div>
                </div>
            </div>
         </motion.div>

         {/* RIGHT: ALCHEMIST */}
         <motion.div 
            className="relative flex-1 group cursor-pointer md:border-l border-white/5"
            data-focus-type="world"
            data-focus-id={ViewState.PROFESSIONAL}
            onMouseMove={(e) => {
                if (isBelowHoverBoundary(e.clientY)) {
                    setHoveredSide(ViewState.PROFESSIONAL);
                    actions.setFocus({ type: 'world', id: ViewState.PROFESSIONAL });
                } else {
                    setHoveredSide(null);
                    if (actions.focus?.type === 'world' && actions.focus.id === ViewState.PROFESSIONAL) {
                        actions.setFocus(null);
                    }
                }
            }}
            onMouseLeave={() => {
                setHoveredSide(null);
                if (actions.focus?.type === 'world' && actions.focus.id === ViewState.PROFESSIONAL) {
                    actions.setFocus(null);
                }
            }}
            onClick={() => {
                actions.setFocus({ type: 'world', id: ViewState.PROFESSIONAL });
                actions.confirm();
                onSelect(ViewState.PROFESSIONAL);
            }}
         >
            <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-8">
                {/* Minimized by 10%: scale-[0.77]->[0.693], sm:scale-[0.97]->[0.873], lg:scale-[1.1]->[0.99] */}
                <div className={`flex flex-col items-start w-full max-w-lg transition-transform duration-700 ${hoveredSide === ViewState.PROFESSIONAL ? '-translate-y-4' : ''} scale-[0.693] sm:scale-[0.873] lg:scale-[0.99] md:-translate-x-[20%] origin-center`}>
                    
                    <div className="mb-4 overflow-hidden w-max">
                        <motion.div 
                            className="flex whitespace-nowrap"
                            animate={{ 
                                letterSpacing: hoveredSide === ViewState.PROFESSIONAL ? '0.6em' : '0.4em'
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            {subtitleText.split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0.3 }}
                                    animate={{ 
                                        opacity: hoveredSide === ViewState.PROFESSIONAL ? 1 : 0.3,
                                        color: hoveredSide === ViewState.PROFESSIONAL ? '#22d3ee' : 'rgba(34, 211, 238, 0.6)',
                                        textShadow: hoveredSide === ViewState.PROFESSIONAL 
                                            ? "0 0 12px rgba(34, 211, 238, 0.8)" 
                                            : "0 0 0px rgba(34, 211, 238, 0)"
                                    }}
                                    transition={{ 
                                        delay: hoveredSide === ViewState.PROFESSIONAL ? i * 0.02 : 0,
                                        duration: 0.4
                                    }}
                                    className="font-tech text-[10px] md:text-xs uppercase font-bold"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>

                    <h2 className={`font-sans font-black text-[2.67rem] sm:text-[4.02rem] md:text-[5.35rem] lg:text-[6.69rem] xl:text-[7.58rem] tracking-tight uppercase transition-all duration-1000 leading-[0.8] text-left ${hoveredSide === ViewState.PROFESSIONAL ? 'text-cyan-300 drop-shadow-[0_0_40px_rgba(34,211,238,0.6)]' : 'text-cyan-300/30'}`}>
                        The <br /> Alchemist
                    </h2>
                    
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: hoveredSide === ViewState.PROFESSIONAL ? '75%' : '40%' }}
                        className="h-[1px] md:h-[2px] bg-gradient-to-r from-cyan-500/60 to-transparent mt-6 md:mt-8"
                    />
                    
                    <div className={`mt-8 flex gap-3 transition-opacity duration-500 ${hoveredSide === ViewState.PROFESSIONAL ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-[8px] md:text-[10px] lg:text-[12px] font-tech text-cyan-400/60 uppercase tracking-widest">NPM INIT</span>
                    </div>
                </div>
            </div>
         </motion.div>
      </div>

      {/* 4. CONTACT STRIP */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/saraliaang"
            target="_blank"
            rel="noreferrer"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-500/5 transition-all hover:border-cyan-200/60 hover:bg-cyan-400/15"
            aria-label="GitHub"
          >
            <Github className="h-6 w-6 text-cyan-100/80 group-hover:text-white transition-colors" />
            <span className="absolute inset-0 rounded-full shadow-[0_0_18px_rgba(34,211,238,0.35)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="https://au.linkedin.com/in/sara-liang-au"
            target="_blank"
            rel="noreferrer"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-500/5 transition-all hover:border-cyan-200/60 hover:bg-cyan-400/15"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-6 w-6 text-cyan-100/80 group-hover:text-white transition-colors" />
            <span className="absolute inset-0 rounded-full shadow-[0_0_18px_rgba(34,211,238,0.35)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="mailto:leungyunyee@gmail.com"
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/20 bg-amber-500/5 transition-all hover:border-amber-200/60 hover:bg-amber-400/15"
            aria-label="Email"
          >
            <Mail className="h-6 w-6 text-amber-100/80 group-hover:text-amber-50 transition-colors" />
            <span className="absolute inset-0 rounded-full shadow-[0_0_18px_rgba(251,191,36,0.35)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </div>
  );
};
