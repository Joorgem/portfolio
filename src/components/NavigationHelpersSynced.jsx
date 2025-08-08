import React, { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';

/**
 * Componente de debug sincronizado com a rotação do astronauta
 * As esferas acompanham o movimento rotativo do modelo
 */
export const NavigationHelpersSynced = ({ 
  visible = true, 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0]
}) => {
  const groupRef = useRef();
  
  // Sincroniza a rotação com o astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      // Copia apenas a rotação Y do astronauta (que é a animação principal)
      groupRef.current.rotation.y = astronautRef.current.rotation.y;
    }
  });
  
  if (!visible) return null;

  return (
    <group 
      ref={groupRef}
      name="navigation-helpers-synced"
      scale={astronautScale}
      position={astronautPosition}
    >
      <group scale={0.01}>
        {Object.entries(NAVIGATION_POINTS).map(([key, point]) => {
          const worldRadius = point.radius;
          
          return (
            <group key={key} position={point.position}>
              {/* Área de detecção - wireframe */}
              <Sphere args={[worldRadius]}>
                <meshBasicMaterial 
                  color={getDebugColor(point.id)}
                  transparent 
                  opacity={0.25} 
                  wireframe
                />
              </Sphere>
              
              {/* Ponto central sólido menor */}
              <Sphere args={[worldRadius * 0.1]}>
                <meshBasicMaterial 
                  color={getDebugColor(point.id)}
                  emissive={getDebugColor(point.id)}
                  emissiveIntensity={0.5}
                />
              </Sphere>
            </group>
          );
        })}
      </group>
    </group>
  );
};

/**
 * Retorna cor específica para cada ponto de navegação
 */
const getDebugColor = (pointId) => {
  const colors = {
    'about': '#ff6b6b',      // Vermelho para cabeça
    'projects': '#4ecdc4',   // Ciano para projetos  
    'experience': '#45b7d1', // Azul para experiência
    'contact': '#96ceb4',    // Verde para contato
    'testimonials': '#ffeaa7' // Amarelo para testimonials
  };
  
  return colors[pointId] || '#ffffff';
};

export default NavigationHelpersSynced;