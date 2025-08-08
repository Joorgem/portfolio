import { Canvas, useFrame } from "@react-three/fiber";
import HeroText from "../components/HeroText";
import ParallaxBackground from "../components/ParallaxBackground";
import { Astronaut } from "../components/Astronaut";
import { Float } from "@react-three/drei";
import { useMediaQuery } from "react-responsive";
// import { easing } from "maath"; // Removido - não usado mais
import { Suspense, useRef, useState, useEffect, useCallback } from "react";
import Loader from "../components/Loader";
import NavigationDebug from "../components/NavigationDebug";
import NavigationSystemStable from "../components/NavigationSystemStable";
import CameraController, { useCameraNavigation } from "../components/CameraController";
import { ScreenOverlay } from "../components/BackgroundTransition";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [debugVisible, setDebugVisible] = useState(false);
  const astronautRef = useRef();
  
  const astronautScale = isMobile ? 0.25 : 0.4;
  const astronautPosition = [-0.08, -0.5, 0];
  
  // Hook de navegação da câmera
  const {
    targetSection,
    currentSection,
    isTransitioning,
    backgroundColor,
    navigateToSection,
    returnToMain,
    onTransitionStart,
    onTransitionComplete,
    onBackgroundChange
  } = useCameraNavigation();
  
  // Handler de navegação - conecta clique com câmera
  const handleNavigate = useCallback((point) => {
    console.log('🚀 Clique detectado:', point.name);
    navigateToSection(point.id);
  }, [navigateToSection]);
  
  // Debug keyboard handler + teclas de navegação
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        setDebugVisible(prev => !prev);
        console.log('Debug toggled:', !debugVisible);
      }
      
      // Tecla ESC para voltar à cena principal
      if (e.key === 'Escape' && currentSection !== 'MAIN') {
        returnToMain();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugVisible, currentSection, returnToMain]);
  
  return (
    <section className="relative flex items-start justify-center h-screen w-screen overflow-hidden md:items-start md:justify-start c-space">
      <HeroText />
      <figure
        className="fixed inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            
            <Astronaut
              ref={astronautRef}
              scale={astronautScale}
              position={astronautPosition}
            />
            
            {/* Sistema de navegação ultra estável */}
            <NavigationSystemStable
              astronautRef={astronautRef}
              astronautScale={astronautScale}
              astronautPosition={astronautPosition}
              onNavigate={handleNavigate}
              debugMode={debugVisible}
            />
            
            {/* Controlador orbital de câmera */}
            <CameraController
              targetSection={targetSection}
              astronautRef={astronautRef}
              astronautPosition={astronautPosition}
              onTransitionStart={onTransitionStart}
              onTransitionComplete={onTransitionComplete}
              onBackgroundChange={onBackgroundChange}
              enabled={true}
            />
            
            {/* Debug visual opcional - DESABILITADO para teste */}
            {false && debugVisible && (
              <NavigationDebug
                visible={true}
                astronautRef={astronautRef}
                astronautScale={astronautScale}
                astronautPosition={astronautPosition}
              />
            )}
            
            {/* Rig REMOVIDO - conflitava com CameraController */}
            {/* {!isTransitioning && <Rig />} */}
          </Suspense>
        </Canvas>
      </figure>
      
      {/* Overlay de transição de fundo */}
      <ScreenOverlay 
        color={backgroundColor}
        opacity={0.85}
        duration={1.0}
      />
      
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
        minWidth: '250px'
      }}>
        <div>🎬 Sistema de Câmera 3D</div>
        <div style={{ marginTop: '5px', fontSize: '12px', opacity: 0.8 }}>
          Ctrl+D: Debug {debugVisible ? 'ON ✓' : 'OFF'} | ESC: Voltar
        </div>
        
        <div style={{ marginTop: '10px' }}>
          <div style={{ color: '#00ff00' }}>
            📍 Seção: {currentSection || 'MAIN'}
          </div>
          {isTransitioning && (
            <div style={{ color: '#ffaa00', fontSize: '12px' }}>
              ⏳ Transicionando...
            </div>
          )}
          {backgroundColor && (
            <div style={{ color: '#ff6b6b', fontSize: '12px' }}>
              🎨 Fundo: {backgroundColor}
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.6 }}>
          • Clique na cabeça ou planetas para navegar<br/>
          • Sistema orbital satelital ativo<br/>
          • Órbita dinâmica implementada
        </div>
      </div>
    </section>
  );
};

// Rig REMOVIDO - causava conflito com CameraController
// function Rig() {
//   return useFrame((state, delta) => {
//     easing.damp3(
//       state.camera.position,
//       [state.mouse.x / 10, 1 + state.mouse.y / 10, 3],
//       0.5,
//       delta
//     );
//   });
// }

export default Hero;
