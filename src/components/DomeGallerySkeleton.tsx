import React from 'react';
import { motion } from 'framer-motion';

interface DomeGallerySkeletonProps {
  className?: string;
}

/**
 * Skeleton loading para DomeGallery com altura fixa
 * Replica o layout visual da DomeGallery para evitar layout shift
 */
const DomeGallerySkeleton: React.FC<DomeGallerySkeletonProps> = ({
  className = "h-[600px] md:h-[700px] lg:h-[750px]"
}) => {
  return (
    <motion.div
      className={`relative bg-transparent ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Container principal que replica o layout da DomeGallery */}
      <div className="relative h-full overflow-hidden">

        {/* Skeleton para o dome central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">

            {/* Círculo principal (dome placeholder) */}
            <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
              {/* Efeito de shimmer */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12" />
              </div>
            </div>

            {/* Placeholder para fotos ao redor */}
            {Array.from({ length: 8 }).map((_, index) => {
              const angle = (index * 45) * (Math.PI / 180);
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={index}
                  className="absolute w-12 h-12 md:w-16 md:h-16 rounded-lg border border-white/10 bg-white/5"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                  }}
                >
                  {/* Shimmer effect para cada foto */}
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    <div
                      className="w-full h-full animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      style={{
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Centro com loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                {/* Spinner sutil */}
                <div className="w-8 h-8 border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
                {/* Loading text */}
                <span className="text-xs text-white/40 font-light tracking-wide">
                  Loading gallery...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay gradient para dar profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default DomeGallerySkeleton;