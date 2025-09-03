import React from 'react';
import { useNavigationStore } from '../stores/navigation.store';
import { useTranslation } from 'react-i18next';

interface NavItem {
  id: string;
  labelKey: string;
}

const navItems: NavItem[] = [
  { id: 'about', labelKey: 'labels.about' },
  { id: 'projects', labelKey: 'labels.projects' },
  { id: 'experience', labelKey: 'labels.experience' },
  { id: 'contact', labelKey: 'labels.contact' },
  { id: 'courses', labelKey: 'labels.courses' },
];

const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation('navigation');
  const navigationState = useNavigationStore(state => state.navigationState);
  const targetSection = useNavigationStore(state => state.targetSection);
  const currentSection = useNavigationStore(state => state.currentSection);
  const startNavigation = useNavigationStore(state => state.startNavigation);
  const canInteract = useNavigationStore(state => state.canInteract);

  // Detecta se é dispositivo móvel
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Não renderiza em desktop
  if (!isMobile) return null;

  // Esconde o menu quando está dentro de uma seção ou em transição
  const shouldHide = navigationState === 'in_section' || 
                     navigationState === 'entering' ||
                     navigationState === 'exiting' ||
                     navigationState === 'zooming_in' ||
                     navigationState === 'zooming_out';

  // Determina qual item está ativo
  const getActiveItem = () => {
    if (currentSection !== 'MAIN' && navigationState === 'in_section') {
      return currentSection.toLowerCase();
    }
    if (targetSection && navigationState === 'orbiting') {
      return targetSection.toLowerCase();
    }
    return null;
  };

  const activeItem = getActiveItem();

  const handleNavClick = (itemId: string) => {
    if (!canInteract()) return;
    
    // Se já está orbitando o mesmo planeta, não faz nada
    if (targetSection?.toLowerCase() === itemId && navigationState === 'orbiting') {
      return;
    }

    // Inicia navegação (entra em órbita)
    startNavigation(itemId);
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-[9997]
        transition-all duration-500 ease-out
        ${shouldHide ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        md:hidden
      `}
    >
      {/* Barra de navegação minimalista */}
      <div className="bg-black/60 backdrop-blur-lg border-t border-white/5">
        <div className="flex justify-around items-center px-2 py-1.5">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const isDisabled = !canInteract();
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                disabled={isDisabled}
                className={`
                  relative flex items-center justify-center
                  py-1.5 px-2
                  transition-all duration-300 ease-out
                  ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Label apenas com texto */}
                <span 
                  className={`
                    text-[11px] font-light tracking-wider uppercase
                    transition-all duration-300
                    ${isActive 
                      ? 'text-white font-medium' 
                      : 'text-white/40'
                    }
                  `}
                >
                  {t(item.labelKey)}
                </span>

                {/* Indicador de ativo sutil */}
                {isActive && (
                  <div 
                    className="
                      absolute bottom-0 left-1/2 -translate-x-1/2
                      w-full h-[1px] bg-white/60
                    "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;