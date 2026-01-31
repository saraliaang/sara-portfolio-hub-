# Sara Portfolio Hub (Deployed)

Sara’s Hub is a cinematic portfolio that feels like a living world. Instead of scrolling through a static document, visitors move through two parallel realms—Voyager (personal journey) and Alchemist (professional work)—where interactions behave like spells: hover awakens, summon confirms, and every action leaves a trace. The experience is intentionally atmospheric and Harry Potter–inspired, blending story, motion, and UI ritual to convey craft, personality, and intent within seconds.

The project is designed for both mouse and gesture input. It layers a gesture-ready interaction system over a richly animated interface: a world map narrative for personal memories, a project galaxy for case studies, and glass/neo-cyan UI systems that keep the experience cohesive while remaining exploratory. The goal is not just to present work, but to create a place that invites discovery.

## Technical Requirements

### Runtime
- Node.js (LTS recommended)
- npm or pnpm

### Core Dependencies
- React
- Vite
- Framer Motion
- Tailwind CSS
- MediaPipe (hand tracking)

### Key Systems
- **Gesture Engine**: Hand tracking + gesture classification, mapped to confirm/dismiss/scroll/summon actions.
- **Action Layer**: Central action API for focus, confirm, dismiss, scroll.
- **Custom Cursor**: Single cursor driven by mouse or gesture input, with gesture priority when enabled.
- **Gesture Guild**: Overlay help UI with animated iconography and descriptions.
- **Universe/World Routing**: Animations between views, hover focus boundaries, and selection via confirm.

### Files of Interest
- `App.tsx`: App shell, view routing, gesture controller mount, guide trigger.
- `components/GestureController.tsx`: Camera UI, gesture handling, cursor mapping.
- `gesture/gesture-logic.ts`: Gesture detection and thresholds.
- `components/UniverseView.tsx`: Landing interactions and hover focus.

## File Structure
```
sara-porfolio-hub-/
├─ components/
│  ├─ GestureController.tsx
│  ├─ UniverseView.tsx
│  ├─ PersonalGalaxy.tsx
│  └─ ProfessionalGalaxy.tsx
├─ gesture/
│  ├─ gesture-logic.ts
│  └─ smoothing.ts
├─ assets/
│  └─ media/
├─ actions.ts
├─ constants.ts
├─ types.ts
├─ App.tsx
└─ README.md
```

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Author
Sara Liang — leungyunyee@gmail.com — https://au.linkedin.com/in/sara-liang-au
