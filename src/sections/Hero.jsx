import { Canvas, useFrame } from "@react-three/fiber";
import HeroText from "../components/HeroText";
import ParallaxBackground from "../components/ParallaxBackground";
import { Astronaut } from "../components/Astronaut";
import { Float } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
import { easing } from "maath";
import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import Loader from "../components/Loader";
import NavigationDebug from "../components/NavigationDebug";
import NavigationSystem from "../components/NavigationSystem";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [debugVisible, setDebugVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const astronautRef = useRef();
  
  const astronautScale = isMobile ? 0.25 : 0.4;
  const astronautPosition = [-0.08, -0.5, 0];
  
  // Handler de navegação
  const handleNavigate = useCallback((point) => {
    console.log('🚀 Navigating to:', point.name);
    setCurrentSection(point);
    setIsTransitioning(true);
    
    // Simula transição
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  }, []);
  
  // Debug keyboard handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        setDebugVisible(prev => !prev);
        console.log('Debug toggled:', !debugVisible);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugVisible]);
  
  return (
    <section className="relative flex items-start justify-center min-h-screen md:items-start md:justify-start c-space">
      <HeroText />
      <figure
        className="fixed inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas camera={{ position: [0, 20, 100], fov: 75 }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Astronaut
              ref={astronautRef}
              scale={astronautScale}
              position={astronautPosition}
            />
            
            {/* Sistema de navegação otimizado e robusto */}
            <NavigationSystem
              astronautRef={astronautRef}
              astronautScale={astronautScale}
              astronautPosition={astronautPosition}
              onNavigate={handleNavigate}
              debugMode={debugVisible}
            />
            
            {/* Debug visual opcional */}
            {debugVisible && (
              <NavigationDebug
                visible={true}
                astronautRef={astronautRef}
                astronautScale={astronautScale}
                astronautPosition={astronautPosition}
              />
            )}
            
            <Rig />
          </Suspense>
        </Canvas>
      </figure>
      
      {/* Info de debug e navegação */}
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <div>🎯 Navegação 3D</div>
        <div style={{ marginTop: '5px', fontSize: '12px', opacity: 0.8 }}>
          Ctrl+D: Debug {debugVisible ? 'ON ✓' : 'OFF'}
        </div>
        {currentSection && (
          <div style={{ marginTop: '10px', color: '#00ff00' }}>
            → {currentSection.name}
            {isTransitioning && ' (transitioning...)'}
          </div>
        )}
        <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.6 }}>
          Passe o mouse sobre a cabeça ou planetas
        </div>
      </div>
    </section>
  );
};

function Rig() {
  return useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [state.mouse.x / 10, 1 + state.mouse.y / 10, 3],
      0.5,
      delta
    );
  });
}

export default Hero;
