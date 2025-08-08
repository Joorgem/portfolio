import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';
import { useNavigationInteraction, useNavigationCursor } from '../hooks/useNavigationInteraction';
import * as THREE from 'three';

/**
 * Hitbox individual super estável sem erros de material
 */
const StableHitbox = React.memo(({ 
  point, 
  onPointerOver,
  onPointerOut,
  onClick,
  isHovered,
  isSelected,
  debugMode 
}) => {
  const meshRef = useRef();
  const [localHover, setLocalHover] = useState(false);
  
  // Handlers
  const handlePointerOver = React.useCallback((e) => {
    e.stopPropagation();
    setLocalHover(true);
    onPointerOver(point);
  }, [point, onPointerOver]);
  
  const handlePointerOut = React.useCallback((e) => {
    e.stopPropagation();
    setLocalHover(false);
    onPointerOut();
  }, [onPointerOut]);
  
  const handleClick = React.useCallback((e) => {
    e.stopPropagation();
    onClick(point);
  }, [point, onClick]);
  
  // Animação suave
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = (isHovered || localHover) ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });
  
  return (
    <group position={point.position}>
      {/* Hitbox usando Sphere do drei - mais estável */}
      <Sphere 
        ref={meshRef}
        args={[point.radius, 16, 16]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <meshBasicMaterial 
          transparent
          opacity={debugMode ? 0.1 : 0}
          color={debugMode ? getDebugColor(point.id) : '#000000'}
          side={THREE.DoubleSide}
        />
      </Sphere>
      
      {/* Visual de hover simples e estável */}
      {(isHovered || localHover) && (
        <Sphere args={[point.radius * 1.1, 16, 16]}>
          <meshBasicMaterial 
            color="#ffffff"
            transparent
            opacity={0.15}
            wireframe
          />
        </Sphere>
      )}
      
      {/* Visual de seleção simples */}
      {isSelected && (
        <Sphere args={[point.radius * 1.2, 16, 16]}>
          <meshBasicMaterial 
            color="#00ff00"
            transparent
            opacity={0.2}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
});

StableHitbox.displayName = 'StableHitbox';

/**
 * Sistema de navegação ultra estável
 */
export const NavigationSystemStable = ({ 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0],
  onNavigate,
  debugMode = false
}) => {
  const groupRef = useRef();
  
  // Hook de interação
  const {
    hoveredPoint,
    selectedPoint,
    isTransitioning,
    handleHover,
    handleClick
  } = useNavigationInteraction({
    onNavigate,
    debugMode,
    hoverDelay: 50,
    clickDelay: 150
  });
  
  // Controle de cursor
  useNavigationCursor(!!hoveredPoint);
  
  // Sincronização suave com astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      const targetRotation = astronautRef.current.rotation.y;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        targetRotation, 
        0.1
      );
    }
  });
  
  // Handlers
  const handlePointerOver = React.useCallback((point) => {
    if (!isTransitioning) {
      handleHover(point);
    }
  }, [handleHover, isTransitioning]);
  
  const handlePointerOut = React.useCallback(() => {
    handleHover(null);
  }, [handleHover]);
  
  return (
    <group 
      ref={groupRef}
      name="navigation-system-stable"
      position={astronautPosition}
      scale={astronautScale}
    >
      <group scale={0.01}>
        {Object.entries(NAVIGATION_POINTS).map(([key, point]) => (
          <StableHitbox
            key={key}
            point={point}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
            isHovered={hoveredPoint?.id === point.id}
            isSelected={selectedPoint?.id === point.id}
            debugMode={debugMode}
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

export default NavigationSystemStable;