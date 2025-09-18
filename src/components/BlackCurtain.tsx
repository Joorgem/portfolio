import React from 'react';
import { useNavigationStore } from '../stores/navigation.store';

const BlackCurtain: React.FC = () => {
  const showTutorial = useNavigationStore(state => state.showTutorial);

  // Se tutorial não está ativo, não renderiza a cortina
  if (!showTutorial) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black z-30"
      style={{
        background: '#000000',
      }}
    />
  );
};

export default BlackCurtain;