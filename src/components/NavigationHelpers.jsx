import React from 'react';
import { Sphere } from '@react-three/drei';
import { NAVIGATION_POINTS } from '../constants/navigationPoints';

/**
 * Componente de debug que mostra esferas visuais nos pontos de navegação
 * IMPORTANTE: As esferas precisam estar dentro do mesmo grupo/escala do astronauta
 * para que as coordenadas correspondam corretamente
 */
export const NavigationHelpers = ({ visible = true, astronautScale = 0.4, astronautPosition = [-0.08, -0.5, 0] }) => {
  if (!visible) return null;

  // As esferas precisam estar no mesmo espaço de coordenadas do modelo
  // Portanto, vamos colocá-las dentro de um grupo com as mesmas transformações
  return (
    <group 
      name="navigation-helpers-container"
      scale={astronautScale}
      position={astronautPosition}
    >
      {/* Grupo interno com mesma escala do modelo */}
      <group scale={0.01}>
        {Object.entries(NAVIGATION_POINTS).map(([key, point]) => {
          const worldRadius = point.radius; // Raio no espaço do modelo
          
          return (
            <group key={key} position={point.position}>
              {/* Área de detecção - wireframe */}
              <Sphere args={[worldRadius]}>
                <meshBasicMaterial 
                  color={getDebugColor(point.id)}
                  transparent 
                  opacity={0.3} 
                  wireframe
                />
              </Sphere>
              
              {/* Ponto central sólido */}
              <Sphere args={[worldRadius * 0.2]}>
                <meshBasicMaterial color={getDebugColor(point.id)} />
              </Sphere>
            </group>
          );
        })}
      </group>
    </group>
  );
};

/**
 * Componente simplificado sem HTML labels (para evitar dependência extra)
 */
export const SimpleNavigationHelpers = ({ visible = true, astronautScale = 0.4, astronautPosition = [-0.08, -0.5, 0] }) => {
  if (!visible) return null;

  return (
    <group 
      name="navigation-helpers-container"
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
                  opacity={0.2} 
                  wireframe
                />
              </Sphere>
              
              {/* Ponto central sólido */}
              <Sphere args={[worldRadius * 0.15]}>
                <meshBasicMaterial color={getDebugColor(point.id)} />
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

/**
 * Hook para controle de visibilidade dos helpers
 */
export const useNavigationDebug = () => {
  const [debugVisible, setDebugVisible] = React.useState(
    process.env.NODE_ENV === 'development'
  );
  
  // Atalho de teclado para toggle (apenas em dev)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e) => {
        if (e.key === 'd' && e.ctrlKey) {
          e.preventDefault();
          setDebugVisible(prev => !prev);
          console.log('Navigation Debug:', !debugVisible ? 'ON' : 'OFF');
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [debugVisible]);
  
  return { debugVisible, setDebugVisible };
};

/**
 * Componente de informações de debug no canto da tela
 */
export const NavigationDebugInfo = ({ currentPoint, mousePosition }) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '5px',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <div>🎯 Navigation Debug</div>
      <div>Ctrl+D: Toggle helpers</div>
      {currentPoint && (
        <>
          <div>---</div>
          <div>Current: {currentPoint.name}</div>
          <div>ID: {currentPoint.id}</div>
          <div>Section: {currentPoint.section}</div>
        </>
      )}
      {mousePosition && (
        <>
          <div>---</div>
          <div>Mouse 3D:</div>
          <div>X: {mousePosition.x?.toFixed(3)}</div>
          <div>Y: {mousePosition.y?.toFixed(3)}</div>
          <div>Z: {mousePosition.z?.toFixed(3)}</div>
        </>
      )}
    </div>
  );
};

export default NavigationHelpers;