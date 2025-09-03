import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectMedia } from '../constants/index';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface OptimizedMediaPlayerProps {
  media: ProjectMedia[];
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
}

const LazyGif = ({ src, alt, onLoad, className }: { 
  src: string; 
  alt: string; 
  onLoad?: () => void;
  className?: string;
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  return (
    <div ref={imgRef} className={className}>
      {isInView && (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center">
              <div className="text-white/50">Carregando...</div>
            </div>
          )}
          <picture>
            <source 
              srcSet={src.replace('.gif', '.webp')} 
              type="image/webp"
              onError={(e) => {
                const img = e.currentTarget.parentElement?.querySelector('img');
                if (img) img.src = src;
              }}
            />
            <img
              src={src}
              alt={alt}
              onLoad={handleLoad}
              className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              loading="lazy"
            />
          </picture>
        </>
      )}
    </div>
  );
};

const GifWithPlaceholder = ({ 
  src, 
  thumbnail, 
  alt, 
  isActive,
  onLoad 
}: { 
  src: string; 
  thumbnail?: string; 
  alt: string;
  isActive: boolean;
  onLoad?: () => void;
}) => {
  const [showGif, setShowGif] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setShowGif(false);
    }
  }, [isActive]);

  const getThumbnail = () => {
    if (thumbnail) return thumbnail;
    return src.replace('.gif', '_thumb.jpg');
  };

  if (!isActive) return null;

  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!showGif ? (
        <>
          <img 
            src={getThumbnail()} 
            alt={alt} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = src;
              setShowGif(true);
            }}
          />
          <button
            onClick={() => setShowGif(true)}
            className={`absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors ${
              isHovering ? 'opacity-100' : 'opacity-80'
            }`}
            aria-label="Play GIF"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
              <Play size={32} className="text-white" fill="white" />
            </div>
          </button>
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded">
            Click para reproduzir
          </div>
        </>
      ) : (
        <LazyGif 
          src={src} 
          alt={alt} 
          onLoad={onLoad}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

const usePreloadMedia = (mediaArray: ProjectMedia[], currentIndex: number) => {
  useEffect(() => {
    const preloadImage = (src: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'image';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    };

    const cleanupFunctions: (() => void)[] = [];

    const nextIndex = (currentIndex + 1) % mediaArray.length;
    const nextMedia = mediaArray[nextIndex];
    
    if (nextMedia) {
      if (nextMedia.type === 'gif') {
        cleanupFunctions.push(preloadImage(nextMedia.src.replace('.gif', '_thumb.jpg')));
        
        const webpSrc = nextMedia.src.replace('.gif', '.webp');
        cleanupFunctions.push(preloadImage(webpSrc));
      } else if (nextMedia.type === 'image') {
        cleanupFunctions.push(preloadImage(nextMedia.src));
      }
    }

    const prevIndex = currentIndex === 0 ? mediaArray.length - 1 : currentIndex - 1;
    const prevMedia = mediaArray[prevIndex];
    
    if (prevMedia) {
      if (prevMedia.type === 'gif') {
        cleanupFunctions.push(preloadImage(prevMedia.src.replace('.gif', '_thumb.jpg')));
      } else if (prevMedia.type === 'image') {
        cleanupFunctions.push(preloadImage(prevMedia.src));
      }
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [currentIndex, mediaArray]);
};

export const OptimizedMediaPlayer: React.FC<OptimizedMediaPlayerProps> = ({
  media,
  className = '',
  autoPlay = false,
  showControls = true,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = media[currentIndex];

  usePreloadMedia(media, currentIndex);

  const handleNext = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, [media.length]);

  const handlePrevious = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, [media.length]);

  const handleMediaLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  useEffect(() => {
    if (!isPaused && autoPlay && currentMedia?.type === 'video' && videoRef.current) {
      const interval = setInterval(() => {
        if (videoRef.current && videoRef.current.ended) {
          handleNext();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [isPaused, autoPlay, currentMedia, handleNext]);

  const renderMedia = () => {
    if (!currentMedia) return null;

    switch (currentMedia.type) {
      case 'image':
        return (
          <picture className="w-full h-full">
            <source 
              srcSet={currentMedia.src.replace(/\.(jpg|png)$/i, '.webp')} 
              type="image/webp"
              onError={(e) => {
                const img = e.currentTarget.parentElement?.querySelector('img');
                if (img) img.src = currentMedia.src;
              }}
            />
            <img
              src={currentMedia.src}
              alt={currentMedia.alt || ''}
              onLoad={handleMediaLoad}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </picture>
        );

      case 'gif':
        return (
          <GifWithPlaceholder
            src={currentMedia.src}
            thumbnail={currentMedia.thumbnail}
            alt={currentMedia.alt || ''}
            isActive={true}
            onLoad={handleMediaLoad}
          />
        );

      case 'video':
        return (
          <video
            ref={videoRef}
            src={currentMedia.src}
            autoPlay={!isPaused}
            loop
            muted
            playsInline
            onLoadedData={handleMediaLoad}
            className="w-full h-full object-cover"
            preload="metadata"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {renderMedia()}
        </motion.div>
      </AnimatePresence>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {showControls && media.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all transform hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all transform hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight size={24} className="text-white" />
          </button>

          {currentMedia?.type === 'video' && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all"
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? <Play size={20} className="text-white" /> : <Pause size={20} className="text-white" />}
            </button>
          )}
        </>
      )}

      {showIndicators && media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsLoading(true);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizedMediaPlayer;