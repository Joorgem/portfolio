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
import { ZoomIndicator } from "../components/ZoomIndicator";

const Hero = () => {
  const isMobile = useMediaQuery({ maxWidth: 853 });
  const [debugVisible, setDebugVisible] = useState(false);
  const astronautRef = useRef();
  
  const astronautScale = isMobile ? 0.25 : 0.4;
  const astronautPosition = [-0.08, -0.5, 0];
  
  // Hook de navegação da câmera
  const {
    // Estados de navegação
    targetSection,
    orbitingSection,
    isTransitioning,
    
    // Estados de zoom
    currentRadius,
    penetrationDepth,
    isInsidePlanet,
    zoomLevel,
    
    // Estados de fade
    fadeColor,
    fadeOpacity,
    
    // Ações
    navigateToSection,
    returnToMain,
    
    // Handlers
    onTransitionStart,
    onTransitionComplete,
    onZoomUpdate
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
      if (e.key === 'Escape' && orbitingSection !== 'MAIN') {
        returnToMain();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugVisible, orbitingSection, returnToMain]);
  
  return (
    <section className="relative flex items-start justify-center h-screen w-screen overflow-hidden md:items-start md:justify-start c-space">
      <HeroText />
      <figure
        className="fixed inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 75, near: 0.001, far: 1000 }}>
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
              onZoomUpdate={onZoomUpdate}
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
      
      {/* Overlay de transição de fundo - SIMPLIFICADO */}
      {fadeColor && fadeOpacity > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: fadeColor,
            opacity: fadeOpacity,
            pointerEvents: 'none',
            zIndex: 5,
            transition: 'opacity 0.2s ease-out'
          }}
        />
      )}
      
      {/* Indicador de zoom */}
      <ZoomIndicator 
        zoomLevel={zoomLevel}
        isInsideSection={isInsidePlanet}
        visible={orbitingSection !== 'MAIN'}
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
            📍 Orbitando: {orbitingSection || 'MAIN'}
          </div>
          {isTransitioning && (
            <div style={{ color: '#ffaa00', fontSize: '12px' }}>
              ⏳ Transicionando...
            </div>
          )}
          {zoomLevel !== 'FAR' && (
            <div style={{ color: '#00ffff', fontSize: '12px' }}>
              🔍 Nível Zoom: {zoomLevel}
            </div>
          )}
          {penetrationDepth > 0 && (
            <div style={{ color: '#ff9900', fontSize: '12px' }}>
              🌊 Penetração: {(penetrationDepth * 100).toFixed(0)}%
            </div>
          )}
          {isInsidePlanet && (
            <div style={{ color: '#ff00ff', fontSize: '12px', fontWeight: 'bold' }}>
              🌍 DENTRO DO PLANETA!
            </div>
          )}
          {fadeOpacity > 0 && (
            <div style={{ color: '#ffff00', fontSize: '11px' }}>
              🎨 Fade: {fadeColor} @ {(fadeOpacity * 100).toFixed(0)}%
            </div>
          )}
          {/* Debug adicional */}
          {orbitingSection !== 'MAIN' && (
            <div style={{ color: '#888888', fontSize: '10px', marginTop: '5px' }}>
              Raio: {currentRadius?.toFixed(2) || '?'} | Dentro: {isInsidePlanet ? 'SIM' : 'NÃO'}
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.6 }}>
          • Clique na cabeça ou planetas para navegar<br/>
          • Use o scroll/wheel para zoom in/out<br/>
          • Zoom máximo entra na seção<br/>
          • ESC ou scroll reverso para sair
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
