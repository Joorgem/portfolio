import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResponsiveOrbitControlsProps {
  onViewModeChange: (_mode: 'orbital' | 'linear') => void;
}

export const ResponsiveOrbitControls: React.FC<ResponsiveOrbitControlsProps> = ({ 
  onViewModeChange 
}) => {
  const [viewMode, setViewMode] = useState<'orbital' | 'linear'>('orbital');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-switch to linear mode on very small screens
      if (mobile && window.innerWidth < 480) {
        setViewMode('linear');
        onViewModeChange('linear');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onViewModeChange]);

  const handleViewModeToggle = () => {
    const newMode = viewMode === 'orbital' ? 'linear' : 'orbital';
    setViewMode(newMode);
    onViewModeChange(newMode);
  };

  if (!isMobile) return null; // Only show controls on mobile

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.button
        onClick={handleViewModeToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-full border border-white/20 hover:border-white/40 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: viewMode === 'orbital' ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'orbital' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </motion.div>
        
        <span className="text-sm">
          {viewMode === 'orbital' ? 'List View' : 'Orbit View'}
        </span>
      </motion.button>
    </motion.div>
  );
};

export default ResponsiveOrbitControls;