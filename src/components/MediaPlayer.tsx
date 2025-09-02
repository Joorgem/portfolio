import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectMedia } from '../constants/index';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentMedia = media[currentIndex];

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
          />
        );
      
      case 'gif':
        return (
          <img
            src={currentMedia.src}
            alt={currentMedia.alt}
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
          />
        );
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
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
      {showControls && currentMedia.type === 'video' && (
        <motion.button
          onClick={handlePlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute bottom-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </motion.button>
      )}

      {/* Media Type Badge */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
        {currentMedia.type.toUpperCase()}
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
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{currentMedia.description}</p>
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;