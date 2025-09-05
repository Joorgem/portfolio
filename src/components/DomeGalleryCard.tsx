import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DomeGallery from './DomeGallery';
import { createPortal } from 'react-dom';
import { ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigationStore } from '../stores/navigation.store';

type PhotoItem = { id: string; url: string; caption: string };

interface DomeGalleryCardProps {
  photos: PhotoItem[];
  title?: string;
  className?: string;
  initialExpanded?: boolean;
}

const DomeGalleryCard: React.FC<DomeGalleryCardProps> = ({
  photos,
  title = "Photo Gallery",
  className = "",
  initialExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get scroll lock functions from navigation store
  const lockScroll = useNavigationStore(state => state.lockScroll);
  const unlockScroll = useNavigationStore(state => state.unlockScroll);

  // Check if component is mounted (for SSR safety)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock both body scroll and navigation scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      // Lock navigation store scroll handling
      lockScroll();
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock navigation store scroll handling
      unlockScroll();
      // Unlock body scroll
      document.body.style.overflow = '';
    }

    return () => {
      // Cleanup: always unlock on component unmount
      unlockScroll();
      document.body.style.overflow = '';
    };
  }, [isExpanded, lockScroll, unlockScroll]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        handleClose();
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DomeGalleryCard: handleExpand called', { 
      isAnimating, 
      isExpanded, 
      isMounted,
      photosLength: photos.length 
    });
    if (isAnimating) return;
    setIsAnimating(true);
    setIsExpanded(true);
  };

  const handleClose = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsExpanded(false);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  // Collapsed state component
  const CollapsedCard = () => (
    <motion.div
      ref={cardRef}
      className={`group relative h-[400px] md:h-[480px] lg:h-[500px] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
      onClick={handleExpand}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
      
      {/* Preview DomeGallery - smaller and with overlay */}
      <div className="relative h-full overflow-hidden">
        {/* Disable all pointer events on the preview DomeGallery to prevent click conflicts */}
        <div className="absolute inset-0 scale-[0.65] -translate-y-12 opacity-50 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none">
          <DomeGallery
            photos={photos}
            fit={0.4}
            minRadius={400}
            maxVerticalRotation={20}
            segments={24}
            dragDampening={0.98}
            grayscale={true}
            overlayBlurColor="transparent"
          />
        </div>

        {/* Gradient overlay to create preview effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 md:mb-3">
                {title}
              </h3>
              <p className="text-gray-300 text-sm flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                {photos.length} photos • Click to explore
              </p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <ChevronUpIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-white transition-colors duration-200" />
            </div>
          </div>
        </div>

        {/* Interactive hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      {/* Subtle accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
    </motion.div>
  );

  // Expanded state component (fullscreen)
  const ExpandedView = () => (
    <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onAnimationComplete={handleAnimationComplete}
      >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-gray-700/50 hover:bg-black/70 transition-all duration-200 group"
        aria-label="Close gallery"
      >
        <XMarkIcon className="w-6 h-6 text-gray-300 group-hover:text-white" />
      </button>

      {/* Title */}
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-gray-300 text-sm mt-1">{photos.length} photos</p>
      </div>

      {/* Full DomeGallery */}
      <motion.div
        className="w-full h-full p-12 pt-20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <DomeGallery
          photos={photos}
          fit={window.innerWidth < 768 ? 0.6 : 0.8}
          minRadius={window.innerWidth < 768 ? 400 : 700}
          maxVerticalRotation={30}
          segments={window.innerWidth < 768 ? 28 : 40}
          dragDampening={0.9}
          grayscale={false}
          overlayBlurColor="transparent"
        />
      </motion.div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={handleClose}
        aria-label="Click to close gallery"
      />
    </motion.div>
  );

  return (
    <>
      {/* Collapsed state - always rendered but hidden when expanded */}
      <div style={{ 
        opacity: isExpanded ? 0 : 1, 
        pointerEvents: isExpanded ? 'none' : 'auto',
        transition: 'opacity 0.3s ease-in-out'
      }}>
        <CollapsedCard />
      </div>

      {/* Expanded state - rendered in portal only when mounted */}
      {isMounted && (
        <AnimatePresence mode="wait">
          {isExpanded && createPortal(<ExpandedView />, document.body)}
        </AnimatePresence>
      )}
    </>
  );
};

export default DomeGalleryCard;