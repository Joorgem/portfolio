# 3D Space Portfolio

Personal, immersive web portfolio with a 3D astronaut experience (React + Three.js) and an alternative One Page view. Built for my brand and learning — code is public for inspection, not intended as a template.

[![Live Portfolio](https://img.shields.io/badge/Live%20Demo-jorgemolina.dev-00d8ff?style=for-the-badge&logo=vercel)](https://jorgemolina.dev)
[![Repository](https://img.shields.io/badge/Repository-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/Joorgem/portfolio)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.173-000000?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-2D2D2D?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

## Overview
- Two modes: Immersive 3D (astronaut + planets as sections) and One Page (classic scroll).
- Cinematic transitions from space to section content with a 7‑state 3D navigation system.
- Mobile‑first: adaptive scaling, gesture handling, throttling, and progressive loading.

## Visual Demo

Camera orbit and transitions (live demo):

https://github.com/user-attachments/assets/cc6417d2-d395-4677-aa47-3422ccf6df76

Inverted scroll mechanics (spatial navigation):

https://github.com/user-attachments/assets/1a4d7744-3d7c-4376-b37f-96195ab4c2a1

Mobile‑optimized interface (touch / adaptive controls):

https://github.com/user-attachments/assets/929347d3-040d-4694-9e12-54d4bc079f7b

3D model workflow (Blender):

![Blender Pipeline](https://i.imgur.com/e9zAdRw.png)

## Architecture
### 3D Navigation State (Zustand)
```ts
idle → orbiting → zooming_in → entering → in_section → exiting → zooming_out → idle
```

### Portfolio Mode State
The mode selector is driven by a small state machine in `src/stores/navigation.store.ts`:
```
modeStatus: selector → loading-3d → ready-3d → ready-onepage
```
- UI triggers only `setPortfolioMode('3d'|'onepage')` and show/hide of the selector.
- Store owns timeouts (5s fallback) and session intent (short‑lived in sessionStorage).

### Performance Tactics
- Frameloop on demand, object reuse, throttled events, chunk preloading for 3D.
- Event listeners run only when the 3D scene is ready, reducing unnecessary work.

## Getting Started
### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm 8+ or yarn 1.22+
- Modern browser with WebGL 2.0

### Install & Run
```bash
git clone https://github.com/Joorgem/portfolio
cd portfolio
npm install

# Dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables
Create a `.env` from `.env.example`:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_RECIPIENT_EMAIL=contato@jorgemolina.dev
VITE_RECIPIENT_NAME=Jorge
```
Notes:
- Restrict allowed origins in your EmailJS dashboard to prevent abuse.
- Consider adding a honeypot/Turnstile in the contact form for spam protection.

## Tech Stack
- React 19, TypeScript 5.9, Vite 6
- Three.js, @react-three/fiber, @react-three/drei
- Zustand 5, Framer Motion 12, Tailwind CSS 4

## License & Assets
- Code and content are covered by the terms in [LICENSE.md](LICENSE.md).
- Third‑party logos and trademarks are property of their respective owners and are used here for descriptive purposes only.
- Portfolio images, models and media are not licensed for reuse.

## Contact
- Live: https://jorgemolina.dev
- LinkedIn: https://linkedin.com/in/jorge-molina-539394197
- Email: contato@jorgemolina.dev

— Thanks for checking out my work! 🚀

