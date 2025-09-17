import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { NAVIGATION_POINTS, NavigationPoint } from '../constants/navigationPoints';
import { useNavigationInteraction, useNavigationCursor } from '../hooks/useNavigationInteraction';
import { useNavigationStore } from '../stores/navigation.store';
import { useTranslation } from 'react-i18next';
import { ObjectPool } from '../utils/objectPool';
import * as THREE from 'three';

interface StableHitboxProps {
  point: NavigationPoint;
  onPointerOver: (_point: NavigationPoint) => void;
  onPointerOut: () => void;
  onClick: (_point: NavigationPoint) => void;
  isHovered: boolean;
  isSelected: boolean;
  debugMode: boolean;
}

/**
 * Hitbox individual super estável sem erros de material
 */
const StableHitbox = React.memo<StableHitboxProps>(({ 
  point, 
  onPointerOver,
  onPointerOut,
  onClick,
  isHovered,
  isSelected,
  debugMode 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [localHover, setLocalHover] = useState(false);
  // const { t } = useTranslation('common'); // Unused
  
  // Use isSelected to avoid unused variable warning
  void isSelected;
  
  // Handlers
  const handlePointerOver = React.useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setLocalHover(true);
    onPointerOver(point);
  }, [point, onPointerOver]);
  
  const handlePointerOut = React.useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    setLocalHover(false);
    onPointerOut();
  }, [onPointerOut]);
  
  const handleClick = React.useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    onClick(point);
  }, [point, onClick]);
  
  // Animação suave - using object pool for performance
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = (isHovered || localHover) ? 1.05 : 1;
      meshRef.current.scale.lerp(ObjectPool.tempVector1.set(targetScale, targetScale, targetScale), 0.1);
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
    </group>
  );
});

StableHitbox.displayName = 'StableHitbox';

interface NavigationSystemStableProps {
  astronautRef: React.RefObject<THREE.Group>;
  astronautScale?: number;
  astronautPosition?: [number, number, number];
  onNavigate: (_point: NavigationPoint) => void;
  debugMode?: boolean;
}

/**
 * Sistema de navegação ultra estável
 */
export const NavigationSystemStable: React.FC<NavigationSystemStableProps> = ({ 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0],
  onNavigate,
  debugMode = false
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { t } = useTranslation('navigation');
  
  // Function to get planet name from translation
  const getPlanetName = (point: NavigationPoint) => {
    return t(`points.${point.id}.name`, point.id);
  };
  
  // MOBILE FIX: Detecta dispositivo móvel
  const isMobileDevice = window.innerWidth < 768;
  
  // Hook de interação com delays adaptados para mobile
  const {
    hoveredPoint,
    selectedPoint,
    isTransitioning,
    handleHover,
    handleClick
  } = useNavigationInteraction({
    onNavigate,
    debugMode,
    hoverDelay: isMobileDevice ? 0 : 50,      // Mobile: sem delay no hover
    clickDelay: isMobileDevice ? 50 : 150      // Mobile: click mais rápido
  });
  
  // Controle de cursor e atualização da store
  useNavigationCursor(!!hoveredPoint);
  
  // Atualiza o planeta hover na store
  const setHoveredPlanet = useNavigationStore(state => state.setHoveredPlanet);
  
  React.useEffect(() => {
    if (hoveredPoint) {
      setHoveredPlanet(getPlanetName(hoveredPoint));
    } else {
      setHoveredPlanet(null);
    }
  }, [hoveredPoint, setHoveredPlanet, getPlanetName]);
  
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
  const handlePointerOver = React.useCallback((point: NavigationPoint) => {
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
const getDebugColor = (pointId: string): string => {
  const colors: Record<string, string> = {
    'about': '#ff6b6b',
    'projects': '#4ecdc4',
    'experience': '#45b7d1',
    'contact': '#96ceb4',
    'courses': '#ffeaa7'
  };
  return colors[pointId] || '#ffffff';
};

export default NavigationSystemStable;