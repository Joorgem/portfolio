import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download, FileText } from 'lucide-react';

interface DownloadResumeCardProps {
  className?: string;
}

const DownloadResumeCard: React.FC<DownloadResumeCardProps> = ({ className = '' }) => {
  const { t } = useTranslation('about');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const link = document.createElement('a');
      link.href = '/assets/resume/JorgeMatheusMolinaDavid_Currículo.pdf';
      link.download = 'Jorge_Molina_Resume.pdf';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        setIsDownloading(false);
      }, 800);
    } catch (error) {
      console.error('Error downloading resume:', error);
      setIsDownloading(false);
    }
  };

  return (
    <div className={`group relative p-6 flex-1 min-h-[180px] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
      
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center space-y-4">
        {/* Minimalist Icon */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <FileText className="w-7 h-7 text-gray-400" />
        </motion.div>

        {/* Simple Title */}
        <h3 className="text-lg font-medium text-gray-100">
          {t('resume.title', 'Resume')}
        </h3>

        {/* Ghost Button - shadcn inspired */}
        <motion.button
          onClick={handleDownload}
          disabled={isDownloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            inline-flex items-center justify-center gap-2 
            px-4 py-2 text-sm font-medium
            border border-gray-600/30 rounded-lg
            bg-transparent text-gray-300
            hover:bg-gray-800/50 hover:text-white hover:border-gray-500/50
            focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:ring-offset-2 focus:ring-offset-black/20
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isDownloading ? 'animate-pulse' : ''}
          `}
          aria-label={t('resume.downloadButton', 'Download PDF Resume')}
        >
          <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          <span>
            {isDownloading 
              ? t('resume.downloading', 'Downloading...') 
              : t('resume.downloadButton', 'Download PDF')
            }
          </span>
        </motion.button>
      </div>

      {/* Subtle accent line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
    </div>
  );
};

export default DownloadResumeCard;