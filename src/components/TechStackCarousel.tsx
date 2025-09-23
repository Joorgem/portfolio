import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface TechStackItem {
  name: string;
  src: string;
}

interface TechStackCarouselProps {
  techStack: TechStackItem[];
  className?: string;
}

const TechStackCarousel: React.FC<TechStackCarouselProps> = ({
  techStack,
  className = ''
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: true,
      containScroll: 'trimSnaps'
    },
    [
      Autoplay({
        delay: 3000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false
      })
    ]
  );

  useEffect(() => {
    if (emblaApi) {
      // Log para debug
      console.log('Embla Carousel initialized');
    }
  }, [emblaApi]);

  return (
    <div className={`relative ${className}`}>
      {/* Carousel container - padding extra para hover effects */}
      <div className="overflow-hidden py-4" ref={emblaRef}>
        <div className="flex">
          {techStack.map((tech, index) => (
            <motion.div
              key={`${tech.name}-${index}`}
              className="flex-[0_0_auto] min-w-0 pl-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (index % 6) * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <div className="flex flex-col items-center p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 w-32 h-32">
                <img
                  src={tech.src}
                  alt={tech.name}
                  className="w-12 h-12 object-contain mb-3 filter brightness-90 hover:brightness-110 transition-all duration-300"
                />
                <span className="text-gray-300 text-sm font-medium text-center leading-tight">
                  {tech.name}
                </span>
              </div>
            </motion.div>
          ))}
          {/* Duplicate items for seamless loop */}
          {techStack.map((tech, index) => (
            <motion.div
              key={`${tech.name}-duplicate-${index}`}
              className="flex-[0_0_auto] min-w-0 pl-4"
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <div className="flex flex-col items-center p-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 w-32 h-32">
                <img
                  src={tech.src}
                  alt={tech.name}
                  className="w-12 h-12 object-contain mb-3 filter brightness-90 hover:brightness-110 transition-all duration-300"
                />
                <span className="text-gray-300 text-sm font-medium text-center leading-tight">
                  {tech.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>


      {/* Gradient overlays para efeito fade - ajustados para novo padding */}
      <div className="absolute left-0 top-4 bottom-4 w-16 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-4 bottom-4 w-16 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default TechStackCarousel;