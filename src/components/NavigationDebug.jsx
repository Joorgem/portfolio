import React, { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';

/**
 * Componente de debug para visualizar pontos de navegação
 * Sincronizado com a rotação do astronauta
 */
export const NavigationDebug = ({ 
  visible = true, 
  astronautRef,
  astronautScale = 0.4,
  astronautPosition = [-0.08, -0.5, 0]
}) => {
  const groupRef = useRef();
  
  // Sincroniza a rotação com o astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      // Copia a rotação Y do astronauta
      groupRef.current.rotation.y = astronautRef.current.rotation.y;
    }
  });
  
  if (!visible) return null;

  return (
    <group 
      ref={groupRef}
      name="navigation-debug"
      position={astronautPosition}
      scale={astronautScale}
    >
      {/* Grupo interno com mesma escala do modelo */}
      <group scale={0.01}>
        {Object.entries(NAVIGATION_POINTS).map(([key, point]) => {
          return (
            <group key={key} position={point.position}>
              {/* Esfera wireframe */}
              <Sphere args={[point.radius]}>
                <meshBasicMaterial 
                  attach="material"
                  color={getDebugColor(point.id)}
                  transparent={true}
                  opacity={0.3} 
                  wireframe={true}
                />
              </Sphere>
              
              {/* Centro sólido */}
              <Sphere args={[point.radius * 0.1]}>
                <meshBasicMaterial 
                  attach="material"
                  color={getDebugColor(point.id)}
                />
              </Sphere>
            </group>
          );
        })}
      </group>
    </group>
  );
};

const getDebugColor = (pointId) => {
  const colors = {
    'about': '#ff0000',      // Vermelho
    'projects': '#00ffff',   // Ciano
    'experience': '#0099ff', // Azul
    'contact': '#00ff00',    // Verde
    'testimonials': '#ffff00' // Amarelo
  };
  
  return colors[pointId] || '#ffffff';
};

export default NavigationDebug;