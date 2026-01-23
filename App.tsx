
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { StarBackground } from './components/StarBackground';
import { UniverseView } from './components/UniverseView';
import { PersonalGalaxy } from './components/PersonalGalaxy';
import { ProfessionalGalaxy } from './components/ProfessionalGalaxy';
import { CustomCursor } from './components/CustomCursor';
import { ViewState } from './types';
import { FocusTarget, useActionLayer } from './actions';
import { GestureController } from './components/GestureController';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.UNIVERSE);
  const actions = useActionLayer();
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [virtualCursor, setVirtualCursor] = useState<{ x: number; y: number } | null>({
    x: -1000,
    y: -1000,
  });
  const virtualCursorRef = useRef<{ x: number; y: number } | null>(virtualCursor);
  const [guideOpen, setGuideOpen] = useState(false);
  const lastGestureAtRef = useRef(0);

  const handleBack = () => setView(ViewState.UNIVERSE);

  useEffect(() => {
    document.body.classList.add('force-cursor-none');
    return () => {
      document.body.classList.remove('force-cursor-none');
    };
  }, []);


  const emitVirtualCursor = useCallback((position: { x: number; y: number } | null) => {
    if (!position) return;
    window.dispatchEvent(
      new CustomEvent('virtual-cursor', {
        detail: { x: position.x, y: position.y },
      })
    );
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gestureEnabled && Date.now() - lastGestureAtRef.current < 800) return;
      const next = { x: e.clientX, y: e.clientY };
      virtualCursorRef.current = next;
      setVirtualCursor(next);
      emitVirtualCursor(next);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [gestureEnabled, emitVirtualCursor]);

  const parseFocusTarget = useCallback((el: Element | null): FocusTarget | null => {
    let node: HTMLElement | null = el as HTMLElement | null;
    while (node) {
      const type = node.dataset.focusType;
      if (type) {
        if (type === 'world' && node.dataset.focusId) {
          return { type: 'world', id: node.dataset.focusId as ViewState };
        }
        if (type === 'place' && node.dataset.focusId) {
          return { type: 'place', id: node.dataset.focusId };
        }
        if (type === 'project' && node.dataset.focusId) {
          return { type: 'project', id: node.dataset.focusId };
        }
        if (type === 'link' && node.dataset.focusUrl) {
          return { type: 'link', url: node.dataset.focusUrl };
        }
        if (type === 'guide') return { type: 'guide' };
        if (type === 'guide-close') return { type: 'guide-close' };
        if (type === 'back') return { type: 'back' };
      }
      node = node.parentElement;
    }
    return null;
  }, []);

  const isSameFocus = useCallback((a: FocusTarget | null, b: FocusTarget | null) => {
    if (!a || !b) return a === b;
    if (a.type !== b.type) return false;
    if (a.type === 'world' && b.type === 'world') return a.id === b.id;
    if (a.type === 'place' && b.type === 'place') return a.id === b.id;
    if (a.type === 'project' && b.type === 'project') return a.id === b.id;
    if (a.type === 'link' && b.type === 'link') return a.url === b.url;
    return a.type === b.type;
  }, []);

  useEffect(() => {
    if (!gestureEnabled || !virtualCursor) return;
    const el = document.elementFromPoint(virtualCursor.x, virtualCursor.y);
    const nextFocus = parseFocusTarget(el);
    if (!isSameFocus(nextFocus, actions.focus)) {
      actions.setFocus(nextFocus);
    }
  }, [virtualCursor, gestureEnabled, parseFocusTarget, isSameFocus, actions]);

  const syncFocusFromCursor = useCallback(() => {
    if (!virtualCursorRef.current) return;
    const { x, y } = virtualCursorRef.current;
    const elements = document.elementsFromPoint(x, y);
    let nextFocus: FocusTarget | null = null;
    for (const el of elements) {
      const resolved = parseFocusTarget(el);
      if (resolved) {
        nextFocus = resolved;
        break;
      }
    }
    if (
      view === ViewState.UNIVERSE &&
      nextFocus?.type === 'world' &&
      y < window.innerHeight * 0.35
    ) {
      nextFocus = null;
    }
    if (!isSameFocus(nextFocus, actions.focus)) {
      actions.setFocus(nextFocus);
    }
    return nextFocus;
  }, [parseFocusTarget, isSameFocus, actions, view]);

  const handleGesture = useCallback(
    (gesture: string | null) => {
      switch (gesture) {
        case 'CONFIRM':
          actions.confirm(syncFocusFromCursor());
          break;
        case 'SCROLL_LEFT':
          actions.scrollBy(-1);
          break;
        case 'SCROLL_RIGHT':
          actions.scrollBy(1);
          break;
        case 'SUMMON':
          actions.confirm(syncFocusFromCursor());
          break;
        case 'DISMISS':
          actions.dismiss();
          break;
      }
    },
    [actions, syncFocusFromCursor]
  );

  useEffect(() => {
    if (actions.confirmId === 0) return;
    if (!actions.confirmFocus) return;
    if (actions.confirmFocus.type === 'world') {
      setView(actions.confirmFocus.id);
    }
    if (actions.confirmFocus.type === 'guide') {
      setGuideOpen(true);
    }
    if (actions.confirmFocus.type === 'guide-close') {
      setGuideOpen(false);
    }
    if (actions.confirmFocus.type === 'back') {
      setView(ViewState.UNIVERSE);
    }
  }, [actions.confirmId, actions.confirmFocus]);

  useEffect(() => {
    if (actions.dismissId === 0) return;
    setGuideOpen(false);
  }, [actions.dismissId]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#05020a] text-white">
      <CustomCursor externalPosition={virtualCursor} useExternal />
      
      {/* 
        Persistent Canvas Background (StarBackground).
        We fade this out on the UNIVERSE view because UniverseView now has its own 
        high-fidelity 'LandingTerrain' component. 
      */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${view === ViewState.UNIVERSE ? 'opacity-0' : 'opacity-100'}`}>
         <StarBackground view={view} />
      </div>

      {/* Main Content Router */}
      <AnimatePresence mode="wait">
        
        {view === ViewState.UNIVERSE && (
          <motion.div
            key="universe"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.1 }}
            transition={{ duration: 1 }}
          >
            <UniverseView
              onSelect={setView}
              actions={actions}
              guideOpen={guideOpen}
              onGuideToggle={setGuideOpen}
              gestureEnabled={gestureEnabled}
            />
          </motion.div>
        )}

        {view === ViewState.PERSONAL && (
          <motion.div
            key="personal"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <PersonalGalaxy onBack={handleBack} actions={actions} />
          </motion.div>
        )}

        {view === ViewState.PROFESSIONAL && (
          <motion.div
            key="professional"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <ProfessionalGalaxy onBack={handleBack} actions={actions} />
          </motion.div>
        )}

      </AnimatePresence>

      <GestureGuild isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      <div className="fixed bottom-8 right-5 z-[60] flex items-end gap-4">
        <div className="pointer-events-auto -translate-y-10 -translate-x-6">
          <motion.div
            data-focus-type="guide"
            onMouseEnter={() => actions.setFocus({ type: 'guide' })}
            onMouseLeave={() => {
              if (actions.focus?.type === 'guide') actions.setFocus(null);
            }}
            onClick={() => {
              actions.setFocus({ type: 'guide' });
              actions.confirm();
              setGuideOpen(true);
            }}
            className="relative cursor-pointer flex flex-col items-center justify-center group h-32 w-32"
            initial={false}
          >
            <motion.div
              className="relative flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" className="overflow-visible">
                <circle
                  cx="30" cy="30" r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.5"
                />

                <motion.g
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: "30px 30px" }}
                >
                  <motion.rect
                    x="11" y="11" width="38" height="38"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                    transform="translate(0 -4)"
                    animate={{
                      rotate: [0, -90, -180, -270, -360],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="group-hover:stroke-white transition-colors duration-700"
                  />
                </motion.g>

                <motion.circle
                  cx="30" cy="30" r="19"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                  className="group-hover:stroke-white group-hover:opacity-100 transition-all duration-700"
                />

                <g className="group-hover:opacity-100 opacity-20 transition-opacity duration-700">
                  <circle cx="30" cy="2" r="1.5" fill="#fbbf24" className="shadow-[0_0_8px_#fbbf24]" />
                  <circle cx="30" cy="58" r="1.5" fill="#22d3ee" className="shadow-[0_0_8px_#22d3ee]" />
                </g>
              </svg>
            </motion.div>

            <motion.div
              className="absolute w-2 h-2 bg-white rotate-45 z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute w-12 h-[1px] bg-white/20 blur-[1px] pointer-events-none"
              animate={{
                top: ["20%", "80%", "20%"],
                opacity: [0, 0.5, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 24 }}
              className="absolute pointer-events-none transition-all duration-700"
            >
              <div className="flex flex-col items-center">
                <div className="w-[1px] h-8 bg-gradient-to-b from-white to-transparent" />
                <span className="font-tech text-[10px] uppercase tracking-[1em] text-white font-medium ml-[1em]">
                  Codex
                </span>
              </div>
            </motion.div>

            <div className="absolute right-full pr-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
              <span className="font-tech text-[10px] uppercase tracking-[0.6em] text-white/70">
                Gesture Guild
              </span>
            </div>

            <motion.div
              className="absolute inset-0 border border-amber-300/70 rounded-full scale-[0.8]"
              animate={{
                opacity: [0.45, 0.8, 1, 0.8, 0.45],
                boxShadow: [
                  "0 0 0px rgba(251,191,36,0)",
                  "0 0 14px rgba(251,191,36,0.35)",
                  "0 0 22px rgba(251,191,36,0.55)",
                  "0 0 14px rgba(251,191,36,0.35)",
                  "0 0 0px rgba(251,191,36,0)"
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <GestureController
            enabled={gestureEnabled}
            onCursor={(position) => {
              if (!position) return;
              lastGestureAtRef.current = Date.now();
              virtualCursorRef.current = position;
              setVirtualCursor(position);
              emitVirtualCursor(position);
            }}
            onGesture={handleGesture}
          />
          <button
            onClick={() => setGestureEnabled((prev) => !prev)}
            className="w-full text-[10px] uppercase tracking-[0.3em] font-tech px-3 py-2 rounded-md border border-white/10 bg-black/60 text-white/80 hover:text-white hover:border-white/30 transition"
          >
            {gestureEnabled ? 'Gesture On' : 'Gesture Off'}
          </button>
        </div>
      </div>
    </div>
  );
}

type GestureType = 'confirm' | 'scroll' | 'summon' | 'dismiss';

const KineticIcon: React.FC<{ type: GestureType }> = ({ type }) => {
  const container = "w-24 h-24 flex items-center justify-center";
  const stroke = "white";
  const sw = 0.5;
  const size = 56;

  const icons: Record<GestureType, React.ReactNode> = {
    confirm: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="1" fill={stroke} />
        <motion.path
          d="M10 20 H16 M30 20 H24 M20 10 V16 M20 30 V24"
          stroke={stroke}
          strokeWidth={sw}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </svg>
    ),
    scroll: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <line x1="5" y1="20" x2="35" y2="20" stroke={stroke} strokeWidth={0.2} strokeDasharray="2 2" opacity={0.2} />
        <motion.rect
          x="14" y="14" width="12" height="12"
          stroke={stroke}
          strokeWidth={sw}
          animate={{ x: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
      </svg>
    ),
    summon: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx="20" cy="20" r="2"
            stroke={stroke}
            strokeWidth={sw}
            initial={{ r: 18 - (i * 6), opacity: 0 }}
            animate={{ r: [18 - (i * 6), 2], opacity: [0, 0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.6, ease: "easeOut" }}
          />
        ))}
      </svg>
    ),
    dismiss: (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx="20" cy="20" r="2"
            stroke={stroke}
            strokeWidth={sw}
            initial={{ r: 2, opacity: 0 }}
            animate={{ r: [2, 18 - (i * 6)], opacity: [0, 0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.6, ease: "easeOut" }}
          />
        ))}
      </svg>
    )
  };

  return <div className={container}>{icons[type]}</div>;
};

const GestureCell: React.FC<{ type: GestureType; name: string; description: string; delay: number }> = ({ type, name, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col items-center justify-center p-9 group"
  >
    <div className="mb-5 opacity-100">
      <KineticIcon type={type} />
    </div>
    <div className="text-center">
      <h3 className="font-serif-classic text-xs tracking-[0.5em] text-white/80 uppercase mb-3">
        {name}
      </h3>
      <p className="font-tech text-[10px] uppercase tracking-[0.32em] text-white/60">
        {description}
      </p>
    </div>
  </motion.div>
);

interface GestureGuildProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GestureGuild: React.FC<GestureGuildProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#020203]/28 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div className="relative w-full max-w-2xl z-10 px-4">
            <div className="flex flex-col items-center mb-6">
              <h1 className="font-serif-classic text-2xl tracking-[0.7em] text-white/90 uppercase">
                Charm Guild
              </h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 30 }}
                className="h-px bg-white/10 mt-6"
              />
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5">
              <div className="bg-[#020203]"><GestureCell type="confirm" name="Confirm" description="Pinch + Hold" delay={0.1} /></div>
              <div className="bg-[#020203]"><GestureCell type="scroll" name="Scroll" description="Move to screen edges" delay={0.2} /></div>
              <div className="bg-[#020203]"><GestureCell type="summon" name="Summon" description="Pull Back (Closed)" delay={0.3} /></div>
              <div className="bg-[#020203]"><GestureCell type="dismiss" name="Dismiss" description="Push Forward (Open)" delay={0.4} /></div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <button 
                onClick={onClose}
                className="group flex flex-col items-center gap-4 transition-all"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                  className="p-3 border border-white/40 rounded-full bg-white/5 transition-colors"
                >
                  <X size={12} strokeWidth={1} className="text-white/90" />
                </motion.div>
                <span className="font-tech text-[10px] uppercase tracking-[0.45em] text-white/70">
                  Close System
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
