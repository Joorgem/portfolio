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
  title: _title = "Photo Gallery",
  className = ""
}) => {
  const cardRef = useRef<HTMLDivElement>(null);


  return (
    <motion.div
      ref={cardRef}
      className={`group relative bg-transparent transition-all duration-300 overflow-hidden ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >

      {/* DomeGallery - sem limitações de overflow - tamanho otimizado */}
      <div className="relative h-full overflow-hidden">
        <div className="absolute inset-0 scale-90 md:scale-95 flex items-center justify-center overflow-hidden">
          <DomeGallery
            photos={photos}
            fit={0.6}
            minRadius={250}
            maxVerticalRotation={25}
            dragDampening={0.95}
            grayscale={false}
            overlayBlurColor="transparent"
          />
        </div>
        
      </div>

    </motion.div>
  );

};

export default DomeGalleryCard;