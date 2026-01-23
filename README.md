# Sara Portfolio Hub (Deployed)

This repository mirrors the current `Sara-s-hub-` build 1:1 so the deployed app can be updated without redeployment friction.

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

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Notes
- This repo is a direct mirror of `Sara-s-hub-` by request.
- Keep UI changes minimal unless explicitly requested; visual consistency is critical.
