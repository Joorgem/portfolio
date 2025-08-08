import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';

/**
 * Sistema de navegação interativa 3D
 * Detecta cliques e hover nos pontos de navegação
 */
export const InteractiveNavigation = ({ 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0],
  onNavigate,
  debugMode = false
}) => {
  const groupRef = useRef();
  const { camera, gl } = useThree();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  
  // Raycaster para detecção
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  
  // Sincroniza rotação com astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      groupRef.current.rotation.y = astronautRef.current.rotation.y;
    }
  });
  
  // Handler para movimento do mouse
  const handlePointerMove = useCallback((event) => {
    // Calcula posição do mouse normalizada
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Configura raycaster
    raycaster.current.setFromCamera(mouse.current, camera);
    
    // Verifica interseção com pontos de navegação
    let foundHover = null;
    
    Object.entries(NAVIGATION_POINTS).forEach(([key, point]) => {
      // Calcula posição mundial do ponto considerando todas as transformações
      const worldPos = new THREE.Vector3(
        point.position[0] * 0.01 * astronautScale + astronautPosition[0],
        point.position[1] * 0.01 * astronautScale + astronautPosition[1],
        point.position[2] * 0.01 * astronautScale + astronautPosition[2]
      );
      
      // Aplica rotação do astronauta
      if (astronautRef?.current) {
        const rotation = astronautRef.current.rotation.y;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const x = worldPos.x;
        const z = worldPos.z;
        worldPos.x = x * cos - z * sin;
        worldPos.z = x * sin + z * cos;
      }
      
      // Verifica distância do raio ao ponto
      const distance = raycaster.current.ray.distanceToPoint(worldPos);
      const threshold = point.radius * 0.01 * astronautScale;
      
      if (distance < threshold) {
        foundHover = point;
      }
    });
    
    if (foundHover !== hoveredPoint) {
      setHoveredPoint(foundHover);
      // Muda cursor
      document.body.style.cursor = foundHover ? 'pointer' : 'auto';
      
      if (debugMode && foundHover) {
        console.log('Hovering:', foundHover.name);
      }
    }
  }, [camera, gl, astronautScale, astronautPosition, astronautRef, hoveredPoint, debugMode]);
  
  // Handler para clique
  const handlePointerClick = useCallback((event) => {
    if (hoveredPoint) {
      setSelectedPoint(hoveredPoint);
      
      if (debugMode) {
        console.log('Clicked:', hoveredPoint.name);
      }
      
      // Chama callback de navegação se fornecido
      if (onNavigate) {
        onNavigate(hoveredPoint);
      }
    }
  }, [hoveredPoint, onNavigate, debugMode]);
  
  // Adiciona event listeners
  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handlePointerClick);
    
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handlePointerClick);
      document.body.style.cursor = 'auto';
    };
  }, [gl, handlePointerMove, handlePointerClick]);
  
  // Renderiza efeitos visuais de hover
  return (
    <group 
      ref={groupRef}
      position={astronautPosition}
      scale={astronautScale}
    >
      <group scale={0.01}>
        {Object.entries(NAVIGATION_POINTS).map(([key, point]) => {
          const isHovered = hoveredPoint?.id === point.id;
          const isSelected = selectedPoint?.id === point.id;
          
          return (
            <group key={key} position={point.position}>
              {/* Efeito de hover - pulso */}
              {isHovered && (
                <mesh>
                  <sphereGeometry args={[point.radius * 1.2, 16, 16]} />
                  <meshBasicMaterial 
                    color={point.id === 'about' ? '#ff0000' : '#ffffff'}
                    transparent
                    opacity={0.2}
                    wireframe
                  />
                </mesh>
              )}
              
              {/* Efeito de seleção */}
              {isSelected && (
                <mesh>
                  <sphereGeometry args={[point.radius * 1.3, 16, 16]} />
                  <meshBasicMaterial 
                    color="#00ff00"
                    transparent
                    opacity={0.3}
                    wireframe
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

/**
 * Hook para gerenciar estado de navegação
 */
export const useInteractiveNavigation = () => {
  const [currentSection, setCurrentSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const handleNavigate = useCallback((point) => {
    console.log('Navigating to:', point.name);
    setIsTransitioning(true);
    setCurrentSection(point);
    
    // Simula fim da transição após 2 segundos
    setTimeout(() => {
      setIsTransitioning(false);
    }, 2000);
  }, []);
  
  return {
    currentSection,
    isTransitioning,
    handleNavigate
  };
};

export default InteractiveNavigation;