import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Project as ProjectType } from "../constants/index";
import MediaPlayer from "./MediaPlayer";

interface ProjectProps extends ProjectType {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  index?: number;
}

const Project: React.FC<ProjectProps> = ({
  title,
  subDescription,
  href,
  repositoryUrl,
  media,
  tags,
  isExpanded = false,
  onToggleExpand,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Use isHovered to avoid warning (used in handlers)
  console.log('Project hover state:', isHovered);

  // Layout alternation system:
  // Project 0 (even): [MEDIA] | [TEXT] 
  // Project 1 (odd):  [TEXT] | [MEDIA]
  // Project 2 (even): [MEDIA] | [TEXT]
  const isEven = index % 2 === 0;

  return (
    <>
      {/* Floating Project Card - 50/50 Split Layout */}
      <motion.div
        className="relative max-w-6xl mx-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Equal width columns (50% each on desktop) */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Media Section - Alternates position based on project index */}
          <motion.div 
            className={`relative ${isEven ? 'lg:order-1' : 'lg:order-2'} mb-8 lg:mb-0`}
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative group">
              {/* Subtle glow effect */}
              <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative overflow-hidden rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500">
                <MediaPlayer 
                  media={media} 
                  className="aspect-video h-56 lg:h-64 w-full"
                  autoPlay={true}
                  showControls={false}
                  showIndicators={media.length > 1}
                />
              </div>
            </div>
          </motion.div>

          {/* Content Section - Alternates position opposite to media */}
          <motion.div 
            className={`${isEven ? 'lg:order-2' : 'lg:order-1'} space-y-6`}
            initial={{ opacity: 0, x: isEven ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Project Header */}
            <div className="space-y-4">
              <motion.h3 
                className="text-2xl lg:text-3xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {title}
              </motion.h3>
              
              <motion.p 
                className="text-gray-300 text-base lg:text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {subDescription[0]}
              </motion.p>
            </div>

            {/* Technology Pills */}
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              {tags.slice(0, 5).map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors duration-300"
                >
                  {tag.name}
                </span>
              ))}
              {tags.length > 5 && (
                <span className="px-3 py-1 text-white/60 text-sm">
                  +{tags.length - 5} more
                </span>
              )}
            </motion.div>

            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    {subDescription.slice(0, 3).map((desc, descIndex) => (
                      <motion.p
                        key={descIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * descIndex }}
                        className="text-gray-400 text-sm leading-relaxed"
                      >
                        • {desc}
                      </motion.p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors duration-300"
              >
                <span>View Live</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>

              {repositoryUrl && (
                <motion.a
                  href={repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors duration-300"
                >
                  <span>Code</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </motion.a>
              )}

              <motion.button
                onClick={onToggleExpand}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-2 bg-transparent text-white/70 font-medium rounded-full border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                <span>{isExpanded ? 'Less' : 'More'}</span>
                <motion.svg
                  className="w-4 h-4"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Minimal Media Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <MediaPlayer 
                media={media} 
                className="aspect-video h-96 w-full rounded-2xl"
                autoPlay={false}
                showControls={true}
                showIndicators={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Project;