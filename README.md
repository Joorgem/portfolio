# 🌌 Interactive 3D Portfolio

**Uma experiência espacial cinematográfica construída com React 19, TypeScript e Three.js**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-jorgemolina.dev-00d8ff?style=for-the-badge&logo=vercel)](https://jorgemolina.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

## 🎯 **Conceito**

Portfolio interativo onde o usuário navega como **astronauta pelo espaço**, visitando planetas que representam diferentes seções profissionais. Cada planeta oferece uma experiência imersiva com transições cinematográficas e animações fluidas entre mundos 3D e interfaces 2D.

## 🚀 **Tech Stack**

### **Core Technologies**
- **React 19** - Latest React features with concurrent rendering
- **TypeScript 5.5** - Type-safe development with advanced patterns
- **Vite 6.1** - Lightning-fast build tool with optimized bundling
- **Three.js 0.173** - 3D graphics library for WebGL rendering
- **React Three Fiber 9.0** - React renderer for Three.js

### **State Management & Animations** 
- **Zustand 5.0** - Lightweight state management with complex 7-state navigation system
- **Framer Motion 12.23** - Production-ready motion library for smooth animations
- **Custom Physics Engine** - Orbital mechanics and spatial navigation

### **Styling & UI**
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Custom CSS Variables** - Advanced theming system
- **Responsive Design** - Mobile-first approach with adaptive 3D scaling

### **Internationalization & Performance**
- **i18next** - Multi-language support (PT/EN)
- **Lazy Loading** - Optimized component loading
- **RequestAnimationFrame** - Performance-optimized rendering cycles

## ⚡ **Advanced Features**

### **🌍 Complex 3D Navigation System**
Proprietary **7-state navigation** system with smooth transitions:
```
idle → orbiting → zooming_in → entering → in_section → exiting → zooming_out → idle
```

### **📱 Mobile-Responsive 3D**
- **Adaptive Touch Controls** - Gesture-based navigation optimized for mobile
- **Dynamic Scaling** - Responsive 3D object scaling based on viewport
- **Performance Optimization** - Frame-loop management for smooth mobile experience

### **🎮 Custom Controls**
- **Desktop**: Mouse wheel zoom + Click navigation + ESC key
- **Mobile**: Touch/Swipe gestures + Tap navigation + Custom mobile controls
- **Accessibility**: Keyboard navigation support

### **⚙️ Performance Optimizations**
- **Conditional Canvas Rendering** - `frameloop='demand'` when not in use
- **Object Pooling** - Reusable Three.js geometries and materials
- **Memory Management** - Proper cleanup of 3D objects and event listeners
- **Bundle Optimization** - Code splitting and lazy loading

## 🏗️ **Architecture Highlights**

### **State Management**
```typescript
// Advanced Zustand store with 7 navigation states
const useNavigationStore = create<NavigationState>((set, get) => ({
  navigationState: 'idle',
  currentPlanet: null,
  cameraPosition: [0, 0, 10],
  // Complex state transitions with validation
  canInteract: () => !['entering', 'exiting'].includes(get().navigationState)
}))
```

### **Custom Hooks**
- **`useNavigationInteraction`** - Advanced interaction management with debouncing
- **`useScrollAnimation`** - Performance-optimized scroll handling
- **`useMouseTracking`** - Real-time mouse tracking for 3D interactions

### **3D Rendering Pipeline**
- **Scene Management** - Efficient Three.js scene organization
- **Camera Controllers** - Cinematic camera movements and transitions
- **Lighting System** - Dynamic lighting for spatial atmosphere
- **Particle Systems** - Space dust and atmospheric effects

## 📊 **Project Structure**

```
src/
├── components/          # 3D components and UI elements
│   ├── Astronaut.tsx   # Main 3D character model
│   ├── CameraController.Zustand.tsx  # Cinematic camera control
│   ├── NavigationSystemStable.tsx    # Planetary navigation system
│   └── CustomCursor.tsx             # Interactive cursor system
├── sections/           # Portfolio content sections
│   ├── HeroZustand.tsx    # Main 3D scene orchestrator
│   ├── About.tsx          # Professional background
│   ├── Projects.tsx       # Technical projects showcase
│   ├── Experiences.tsx    # Work experience timeline
│   └── Contact.tsx        # Contact form with EmailJS
├── stores/             # State management
│   └── navigation.store.ts  # Complex navigation state logic
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── i18n/              # Internationalization setup
```

## 🎪 **Key Technical Achievements**

### **🔧 Complex State Management**
- **7-state navigation system** with validation and transitions
- **Performance monitoring** with custom hooks
- **Memory-efficient** state updates with Zustand

### **🎮 Advanced 3D Interactions**
- **Orbital mechanics** simulation for planetary navigation  
- **Collision detection** for interactive elements
- **Smooth interpolation** between 3D positions and rotations

### **📱 Mobile Optimization**
- **Touch sensitivity calibration** for different devices
- **Adaptive performance** based on device capabilities
- **Gesture recognition** for intuitive navigation

### **♿ Accessibility Features**
- **Keyboard navigation** for 3D elements
- **Screen reader support** for content sections
- **Motion sensitivity** options for users

## 🚀 **Quick Start**

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-3d

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📈 **Performance Metrics**

- **Lighthouse Score**: 95+ Performance
- **Bundle Size**: ~1.6MB (optimized)
- **First Contentful Paint**: <2s
- **Mobile Performance**: 90+ score
- **3D Frame Rate**: 60fps on modern devices

## 🎨 **Design Philosophy**

**Minimalist Space Aesthetic** - Clean, modern design inspired by space exploration
**Intuitive Navigation** - Natural gestures and interactions
**Performance First** - Optimized for all devices and network conditions
**Accessibility Focused** - Inclusive design for all users

## 🛠️ **Development Insights**

This portfolio represents **advanced frontend development** showcasing:
- **Complex 3D web applications** with Three.js
- **Performance optimization** for WebGL applications
- **Mobile-responsive 3D experiences**
- **Advanced TypeScript** patterns and architectural design
- **State management** for complex interactive applications

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 **Connect**

- **Portfolio**: [jorgemolina.dev](https://jorgemolina.dev)
- **LinkedIn**: [Jorge Molina](https://linkedin.com/in/jorge-molina-539394197)
- **GitHub**: [@Joorgem](https://github.com/Joorgem)
- **Email**: [contato@jorgemolina.dev](mailto:contato@jorgemolina.dev)

---

**Built with ❤️ by Jorge Molina** | *Turning ideas into immersive digital experiences*