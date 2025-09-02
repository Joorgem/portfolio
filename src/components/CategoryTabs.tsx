import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProjectMedia } from '../constants/index';

interface CategoryTabsProps {
  media: ProjectMedia[];
  onCategoryChange?: (_category: string) => void;
}

const categoryConfig = {
  web: { label: 'Web', icon: '💻', color: 'from-blue-500/20 to-purple-500/20' },
  mobile: { label: 'Mobile', icon: '📱', color: 'from-green-500/20 to-teal-500/20' },
  admin: { label: 'Admin', icon: '⚙️', color: 'from-orange-500/20 to-red-500/20' },
  features: { label: 'Features', icon: '✨', color: 'from-pink-500/20 to-violet-500/20' }
};

const CategoryTabs: React.FC<CategoryTabsProps> = ({ media, onCategoryChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('web');

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
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  if (availableCategories.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-2 justify-center">
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
  );
};

export default CategoryTabs;