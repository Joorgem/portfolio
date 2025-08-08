import React, { useRef } from 'react';
import { Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * Versão simplificada para debug - apenas uma esfera na cabeça
 */
export const NavigationHelpersSimple = ({ 
  visible = true, 
  astronautRef
}) => {
  const groupRef = useRef();
  
  // Sincroniza a rotação com o astronauta
  useFrame(() => {
    if (groupRef.current && astronautRef?.current) {
      groupRef.current.rotation.y = astronautRef.current.rotation.y;
    }
  });
  
  if (!visible) return null;

  // Teste com apenas uma esfera vermelha na cabeça
  return (
    <group ref={groupRef}>
      <Sphere args={[1]} position={[0, 2, 0]}>
        <meshBasicMaterial color="red" wireframe />
      </Sphere>
    </group>
  );
};

export default NavigationHelpersSimple;