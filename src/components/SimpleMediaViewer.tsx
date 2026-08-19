import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProjectMedia } from '../constants/index';
import MediaPlayer from './MediaPlayer';

interface SimpleMediaViewerProps {
  media: ProjectMedia[];
  className?: string;
  hideCategories?: boolean;
  selectedCategory?: string;
}

const categoryConfig = {
  web: { label: 'Web', icon: '💻', color: 'from-blue-500/20 to-purple-500/20' },
  mobile: { label: 'Mobile', icon: '📱', color: 'from-green-500/20 to-teal-500/20' },
  admin: { label: 'Admin', icon: '⚙️', color: 'from-orange-500/20 to-red-500/20' },
  features: { label: 'Features', icon: '✨', color: 'from-pink-500/20 to-violet-500/20' }
};

const SimpleMediaViewer: React.FC<SimpleMediaViewerProps> = ({ 
  media, 
  className = "", 
  hideCategories = false, 
  selectedCategory: externalCategory = 'web' 
}) => {
  const [internalCategory, setInternalCategory] = useState<string>('web');
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Use external category if provided, otherwise use internal
  const selectedCategory = hideCategories ? externalCategory : internalCategory;

  // Group media by category
  const mediaByCategory = media.reduce((acc, item) => {
    const category = item.category || 'web';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ProjectMedia[]>);

  // Get available categories
  const availableCategories = Object.keys(mediaByCategory);

  // Auto-select first available category
  useEffect(() => {
    if (!availableCategories.includes(selectedCategory) && availableCategories.length > 0) {
      if (!hideCategories) {
        setInternalCategory(availableCategories[0]);
      }
    }
  }, [availableCategories, selectedCategory, hideCategories]);

  const currentCategoryMedia = mediaByCategory[selectedCategory] || [];
  const currentMedia = currentCategoryMedia[currentMediaIndex] || currentCategoryMedia[0];

  const handleCategoryChange = (category: string) => {
    setInternalCategory(category);
    setCurrentMediaIndex(0);
  };

  // Determine aspect ratio based on category
  const getAspectRatio = () => {
    if (selectedCategory === 'mobile') {
      return 'aspect-[9/19.5]'; // iPhone 14 Pro Max proportion (1290x2796)
    }
    return 'aspect-video'; // 16:9 for web/admin/features
  };

  // Determine max width based on category  
  const getMaxWidth = () => {
    if (selectedCategory === 'mobile') {
      return 'w-48 max-w-48'; // Smaller for iPhone 14 Pro Max to match desktop height (192px)
    }
    return 'max-w-4xl'; // Larger for desktop content
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Media Display */}
      <div className={`relative ${getAspectRatio()} ${selectedCategory === 'mobile' ? getMaxWidth() : `w-full ${getMaxWidth()}`} mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/10`}>
        {/* Gradient Background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${
            categoryConfig[selectedCategory as keyof typeof categoryConfig]?.color || 'from-gray-500/20 to-gray-600/20'
          } opacity-50`}
        />

        {/* Media Container */}
        <div className="relative w-full h-full">
          {currentMedia && (
            <MediaPlayer
              key={`${selectedCategory}-${currentMediaIndex}`}
              media={[currentMedia]}
              className="w-full h-full"
              autoPlay={false}
              playOnVisible
              showControls={true}
              showIndicators={false}
            />
          )}
        </div>

        {/* Multiple Media Dots */}
        {currentCategoryMedia.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {currentCategoryMedia.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMediaIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentMediaIndex 
                    ? 'w-8 bg-white' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      {!hideCategories && availableCategories.length > 1 && (
        <div className="flex gap-2 mt-6 justify-center">
          {availableCategories.map((category) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            if (!config) return null;

            return (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-300
                  ${selectedCategory === category 
                    ? 'bg-white/20 text-white border border-white/40' 
                    : 'bg-white/10 text-white border border-white/30 hover:bg-white/20 hover:text-white'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{config.icon}</span>
                  <span>{config.label}</span>
                  {mediaByCategory[category].length > 1 && (
                    <span className="text-xs opacity-60">
                      ({mediaByCategory[category].length})
                    </span>
                  )}
                </span>

                {/* Active Indicator */}
                {selectedCategory === category && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 border-2 border-white/30 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Media Description */}
      {currentMedia?.description && (
        <p className="text-center text-sm text-white mt-4 font-medium">
          {currentMedia.description}
        </p>
      )}
    </div>
  );
};

export default SimpleMediaViewer;