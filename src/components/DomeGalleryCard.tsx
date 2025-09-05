import { useRef } from 'react';
import { motion } from 'framer-motion';
import DomeGallery from './DomeGallery';

type PhotoItem = { id: string; url: string; caption: string };

interface DomeGalleryCardProps {
  photos: PhotoItem[];
  title?: string;
  className?: string;
}

const DomeGalleryCard: React.FC<DomeGalleryCardProps> = ({
  photos,
  title = "Photo Gallery",
  className = ""
}) => {
  const cardRef = useRef<HTMLDivElement>(null);


  return (
    <motion.div
      ref={cardRef}
      className={`group relative h-[400px] md:h-[480px] lg:h-[500px] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 overflow-hidden ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
      
      {/* DomeGallery - agora com clicks habilitados */}
      <div className="relative h-full overflow-hidden">
        <div className="absolute inset-0 scale-[0.8] flex items-center justify-center">
          <DomeGallery
            photos={photos}
            fit={0.5}
            minRadius={350}
            maxVerticalRotation={25}
            segments={28}
            dragDampening={0.95}
            grayscale={false}
            overlayBlurColor="transparent"
          />
        </div>
        
      </div>

      {/* Subtle accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
    </motion.div>
  );

};

export default DomeGalleryCard;