import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectMedia } from '../constants/index';
import { Pause, Play, Maximize2, Minimize2 } from 'lucide-react';
import FullscreenCursor from './FullscreenCursor';

const LazyMP4 = ({ src, onLoad, className }: {
  src: string;
  onLoad?: () => void;
  className?: string;
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert GIF path to MP4
  const mp4Src = src.replace('.gif', '.mp4');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1, 
        rootMargin: '200px' // Start loading earlier for video
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center z-10">
          <div className="text-white/60">
            {hasError ? (
              <div className="text-sm">⚠️ Erro no carregamento</div>
            ) : (
              <div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      )}
      
      {isInView && (
        <video
          ref={videoRef}
          src={mp4Src}
          onLoadedData={handleLoadedData}
          onError={handleError}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata" // Only load metadata initially
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
          style={{ aspectRatio: '16/9' }}
        />
      )}
    </div>
  );
};

interface MediaPlayerProps {
  media: ProjectMedia[];
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  showIndicators?: boolean;
}


const MediaPlayer: React.FC<MediaPlayerProps> = ({
  media,
  className = "",
  autoPlay = true,
  showControls = true,
  showIndicators = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMedia = media[currentIndex];

  // Preload next MP4 for smooth transitions
  useEffect(() => {
    if (media.length > 1) {
      const nextIndex = (currentIndex + 1) % media.length;
      const nextMedia = media[nextIndex];
      
      if (nextMedia?.type === 'gif') {
        const mp4Src = nextMedia.src.replace('.gif', '.mp4');
        const video = document.createElement('video');
        video.src = mp4Src;
        video.preload = 'metadata';
        video.muted = true;
        // Don't append to DOM, just trigger preload
      }
    }
  }, [currentIndex, media]);

  // Auto-advance for multiple media items
  useEffect(() => {
    if (media.length > 1 && isPlaying && currentMedia.type !== 'video') {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 5000); // 5 seconds per media item
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentIndex, isPlaying, media.length, currentMedia.type]);

  const handlePlay = () => {
    if (currentMedia.type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMediaLoad = () => {
    setIsLoading(false);
  };

  const handleVideoEnded = () => {
    if (media.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    } else {
      setIsPlaying(false);
    }
  };

  const goToMedia = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
  };

  // Fullscreen API handlers
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen not supported:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const renderMedia = () => {
    switch (currentMedia.type) {
      case 'video':
        return (
          <video
            ref={videoRef}
            src={currentMedia.src}
            poster={currentMedia.thumbnail}
            onLoadedData={handleMediaLoad}
            onEnded={handleVideoEnded}
            autoPlay={autoPlay}
            muted
            loop={media.length === 1}
            className="w-full h-full object-cover"
            preload="metadata"
          />
        );
      
      case 'gif':
        return (
          <LazyMP4
            src={currentMedia.src}
            onLoad={handleMediaLoad}
            className="w-full h-full object-cover"
          />
        );
      
      default:
        return (
          <img
            src={currentMedia.src}
            alt={currentMedia.alt}
            onLoad={handleMediaLoad}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        );
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-black rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fullscreen-media' : ''}`}
      data-white-bg="true"
    >
      {/* Fullscreen Cursor - only render when in fullscreen */}
      {isFullscreen && <FullscreenCursor />}
      
      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10"
          >
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Content */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        {renderMedia()}
      </motion.div>

      {/* Media Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {showControls && currentMedia.type === 'video' && (
          <motion.button
            onClick={handlePlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </motion.button>
        )}
        
        {/* Fullscreen Button */}
        <motion.button
          onClick={toggleFullscreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors backdrop-blur-sm"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Navigation Indicators */}
      {showIndicators && media.length > 1 && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMedia(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Media Description */}
      {currentMedia.description && (
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent ${isFullscreen ? 'p-8' : 'p-4'}`}>
          <p className={`text-white ${isFullscreen ? 'text-lg font-medium' : 'text-sm'}`}>
            {currentMedia.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;