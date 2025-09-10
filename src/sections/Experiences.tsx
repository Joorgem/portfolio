import { Timeline } from "../components/Timeline";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { motion } from "framer-motion";

const Experiences: React.FC = () => {
  const { t, i18n } = useTranslation('experiences');
  
  // Set English as default language only on first visit, without overriding user choice
  useEffect(() => {
    // Only set to English if no language preference exists yet
    if (!localStorage.getItem('portfolio_language')) {
      i18n.changeLanguage('en');
    }
  }, [i18n]); // Empty dependency array - runs only once on mount

  return (
    <section className="relative bg-transparent w-full min-h-screen">{/* Particles inherit from Hero background */}
      
      {/* Minimalist Header - Full Screen */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {t('sectionTitle')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {t('sectionSubtitle')}
          </p>
        </motion.div>
      </div>
      
      {/* Timeline Content */}
      <div className="relative z-10">
        <Timeline useTranslatedData={true} showTitle={false} />
      </div>
    </section>
  );
};

export default Experiences;