import React from 'react';

/**
 * Indicador visual de zoom
 */
export const ZoomIndicator = ({ zoomLevel, isInsideSection, visible = true }) => {
  if (!visible || zoomLevel === 'FAR') return null;
  
  const getZoomInfo = () => {
    switch(zoomLevel) {
      case 'MEDIUM':
        return { text: 'Aproximando do planeta...', color: '#00ffaa', progress: 40 };
      case 'CLOSE':
        return { text: 'Atravessando a superfície...', color: '#ffaa00', progress: 70 };
      case 'INSIDE':
        return { text: 'Dentro do planeta!', color: '#ff00ff', progress: 100 };
      default:
        return { text: '', color: '#ffffff', progress: 0 };
    }
  };
  
  const { text, color, progress } = getZoomInfo();
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '12px 24px',
      borderRadius: '25px',
      border: `2px solid ${color}`,
      color: color,
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      minWidth: '200px',
      opacity: isInsideSection ? (Math.sin(Date.now() / 500) * 0.15 + 0.85) : 1
    }}>
      <div style={{ fontWeight: 'bold' }}>{text}</div>
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ fontSize: '11px', opacity: 0.7 }}>
        Scroll para zoom • ESC para voltar
      </div>
    </div>
  );
};

export default ZoomIndicator;