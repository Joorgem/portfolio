import React, { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';
import * as THREE from 'three';

/**
 * Componente individual de hitbox para cada ponto de navegação
 * Usa mesh invisível para detecção precisa
 */
const NavigationHitbox = ({ 
  point, 
  onHover, 
  onClick, 
  isHovered,
  isSelected,
  showDebug 
}) => {
  const meshRef = useRef();
  const [localHover, setLocalHover] = useState(false);
  
  // Material para hitbox (invisível ou visível em debug)
  const material = useMemo(() => {
    if (showDebug) {
      return (
        <meshBasicMaterial 
          color={getDebugColor(point.id)}
          transparent
          opacity={0.2}
          wireframe
        />
      );
    }
    
    // Material invisível mas ainda detectável
    return (
      <meshBasicMaterial 
        transparent
        opacity={0}
        side={THREE.DoubleSide}
      />
    );
  }, [showDebug, point.id]);
  
  // Handlers de interação
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setLocalHover(true);
    onHover(point);
    document.body.style.cursor = 'pointer';
  }, [point, onHover]);
  
  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setLocalHover(false);
    onHover(null);
    document.body.style.cursor = 'auto';
  }, [onHover]);
  
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick(point);
  }, [point, onClick]);
  
  // Animação de hover
  useFrame((state, delta) => {
    if (meshRef.current && (isHovered || localHover)) {
      // Pulso suave quando hover
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      // Volta ao tamanho normal
      meshRef.current.scale.setScalar(1);
    }
  });
  
  return (
    <group position={point.position}>
      {/* Hitbox principal */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerDown={(e) => e.stopPropagation()} // Previne drag do astronauta
      >
        <sphereGeometry args={[point.radius, 16, 16]} />
        {material}
      </mesh>
      
      {/* Indicador de hover */}
      {(isHovered || localHover) && (
        <mesh>
          <sphereGeometry args={[point.radius * 1.15, 32, 32]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      )}
      
      {/* Indicador de seleção */}
      {isSelected && (
        <>
          <mesh>
            <sphereGeometry args={[point.radius * 1.25, 16, 16]} />
            <meshBasicMaterial 
              color="#00ff00"
              transparent
              opacity={0.2}
              wireframe
            />
          </mesh>
          
          {/* Anel de seleção */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[point.radius * 1.3, point.radius * 0.05, 8, 32]} />
            <meshBasicMaterial 
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}
      
      {/* Label flutuante no hover */}
      {(isHovered || localHover) && (
        <group position={[0, point.radius + 20, 0]}>
          <mesh>
            <planeGeometry args={[80, 20]} />
            <meshBasicMaterial 
              color="#000000"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * Sistema de hitboxes para navegação 3D
 * Mais robusto e preciso que raycasting manual
 */
export const NavigationHitboxes = ({ 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0],
  onNavigate,
  debugMode = false
}) => {
  const groupRef = useRef();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Sincroniza rotação com astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      groupRef.current.rotation.y = astronautRef.current.rotation.y;
    }
  });
  
  // Handlers
  const handleHover = useCallback((point) => {
    setHoveredPoint(point);
    if (debugMode && point) {
      console.log('🎯 Hovering:', point?.name);
    }
  }, [debugMode]);
  
  const handleClick = useCallback((point) => {
    setSelectedPoint(point);
    
    if (debugMode) {
      console.log('🖱️ Clicked:', point.name);
      console.log('📍 Section:', point.section);
    }
    
    // Callback de navegação
    if (onNavigate) {
      onNavigate(point);
    }
  }, [onNavigate, debugMode]);
  
  // Cleanup do cursor ao desmontar
  React.useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);
  
  return (
    <group 
      ref={groupRef}
      name="navigation-hitboxes"
      position={astronautPosition}
      scale={astronautScale}
    >
      <group scale={0.01}>
        {Object.entries(NAVIGATION_POINTS).map(([key, point]) => (
          <NavigationHitbox
            key={key}
            point={point}
            onHover={handleHover}
            onClick={handleClick}
            isHovered={hoveredPoint?.id === point.id}
            isSelected={selectedPoint?.id === point.id}
            showDebug={debugMode}
          />
        ))}
      </group>
    </group>
  );
};

// Cores para debug
const getDebugColor = (pointId) => {
  const colors = {
    'about': '#ff6b6b',
    'projects': '#4ecdc4',
    'experience': '#45b7d1',
    'contact': '#96ceb4',
    'testimonials': '#ffeaa7'
  };
  return colors[pointId] || '#ffffff';
};

export default NavigationHitboxes;