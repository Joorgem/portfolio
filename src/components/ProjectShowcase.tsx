import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project as ProjectType } from '../constants/index';
import SimpleMediaViewer from './SimpleMediaViewer';
import CategoryTabs from './CategoryTabs';

interface ProjectShowcaseProps extends ProjectType {
  index: number;
  labels?: {
    technologies: string;
    links: string;
    viewProject: string;
    code: string;
    viewDetails: string;
    projectDetails: string;
  };
}

const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  title,
  subDescription,
  href,
  repositoryUrl,
  media,
  tags,
  index,
  labels = {
    technologies: 'Technologies',
    links: 'Links',
    viewProject: 'View Project',
    code: 'Code',
    viewDetails: 'View Details',
    projectDetails: 'Project Details'
  }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('web');
  const [videoHeight, setVideoHeight] = useState<number>(400);

  // Updates video height when necessary
  useEffect(() => {
    const updateVideoHeight = () => {
      if (videoRef.current) {
        setVideoHeight(videoRef.current.offsetHeight);
      }
    };

    updateVideoHeight();
    window.addEventListener('resize', updateVideoHeight);
    
    return () => window.removeEventListener('resize', updateVideoHeight);
  }, [media, selectedCategory]);
  
  // Alternating layout
  const isEven = index % 2 === 0;

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen flex items-center py-20 px-6"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${isEven ? '30%' : '70%'} 50%, 
            rgba(59, 130, 246, 0.05) 0%, 
            transparent 50%)`
        }}
      />

      <div className="container mx-auto max-w-6xl">
        <div className="space-y-8">
          
          {/* Header Section - Number, Title, Description */}
          <div className="space-y-6">
            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-white/40 to-transparent" />

            {/* Title */}
            <h2 className="text-4xl lg:text-6xl font-bold text-white">
              {title}
            </h2>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[2fr_1fr] grid-cols-1 gap-6 items-start">
            {/* Media Section - Left */}
            <div className="relative">
              <div ref={videoRef}>
                <SimpleMediaViewer 
                  media={media}
                  className="w-full"
                  hideCategories={true}
                  selectedCategory={selectedCategory}
                />
              </div>
              
              {/* Category Navigation - Aligned with video only */}
              <div className="mt-6">
                <CategoryTabs 
                  media={media} 
                  onCategoryChange={setSelectedCategory}
                />
              </div>
            </div>

            {/* Sidebar - Right */}
            <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
              {/* Normal Sidebar Content - Always visible */}
              <div className="space-y-4">
                {/* Stacks */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-3">{labels.technologies}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 8).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs bg-white/15 text-white rounded-full border border-white/30 backdrop-blur-sm font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="text-base font-semibold text-white mb-3">{labels.links}</h3>
                  <div className="flex flex-col gap-2">
                    {href && href !== "#" && (
                      <motion.a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative px-4 py-2 bg-white text-black font-medium text-sm rounded-lg overflow-hidden text-center"
                        data-white-bg="true"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-1.5">
                          {labels.viewProject}
                          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </motion.a>
                    )}

                    {repositoryUrl && repositoryUrl !== "#" && (
                      <motion.a
                        href={repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-white font-medium text-sm rounded-lg border border-white/50 backdrop-blur-sm text-center"
                        whileHover={{ 
                          scale: 1.02,
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderColor: "rgba(255,255,255,0.5)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.30.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          {labels.code}
                        </span>
                      </motion.a>
                    )}
                    
                    {/* Details Button - Positioned right after buttons */}
                    {!showDetails && (
                      <motion.button
                        onClick={() => setShowDetails(true)}
                        className="w-full px-4 py-2 text-white font-medium text-sm rounded-lg border border-white/50 backdrop-blur-sm text-center bg-black/30"
                        whileHover={{ 
                          scale: 1.02,
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderColor: "rgba(255,255,255,0.7)"
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          {labels.viewDetails}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Overlay - Only when expanded */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 z-10 rounded-lg border border-white/50 backdrop-blur-sm overflow-hidden bg-black/95 flex flex-col"
                    style={{
                      height: `${videoHeight}px`
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* Close Button Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/20">
                      <h3 className="text-lg font-semibold text-white">{labels.projectDetails}</h3>
                      <motion.button
                        onClick={() => setShowDetails(false)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto relative">
                      <div className="p-6 space-y-4">
                        {subDescription.map((desc, i) => (
                          <motion.div
                            key={`desc-${i}-${desc.slice(0, 20)}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.2 }}
                            className="flex items-start gap-3"
                          >
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-white/90 text-sm leading-relaxed">{desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default ProjectShowcase;