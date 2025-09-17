import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Particles from "../components/Particles";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import DomeGalleryCard from "../components/DomeGalleryCard";
import { personalPhotos, placeholderPhotos } from "../data/personalPhotos";

const About: React.FC = () => {
  const { t, i18n } = useTranslation('about');
  const currentLanguage = i18n.language;
  

  // Usar fotos reais do Google Drive
  const photos = useMemo(() => {
    // Usar as fotos configuradas do Google Drive
    return personalPhotos.length > 0 ? personalPhotos : placeholderPhotos;
  }, []);

  return (
    <section className="relative c-space min-h-screen overflow-visible" id="about">
      <Particles
        className="absolute inset-0 -z-50"
        particleColors={['#ffffff', '#f1f5f9', '#e2e8f0']}
        particleCount={80}
        particleSpread={8}
        speed={0.02}
        particleBaseSize={40}
        sizeRandomness={0.6}
        cameraDistance={15}
        moveParticlesOnHover={true}
        particleHoverFactor={0.8}
        alphaParticles={true}
        disableRotation={false}
      />
      
      {/* Main Content Grid */}
      <div className="mt-12 mb-8 overflow-visible">
        {/* Currently Card - Top Section - MOVED UP */}
        <div className="mb-6 -mt-16">
          <div className="group relative inline-block p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.03] hover:border-white/[0.08] max-w-md w-full sm:w-auto">
            <div className="relative">
              {/* Header with title */}
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-gray-100">
                  {t('currently.title')}
                </h3>
              </div>
              
              {/* Content area with status information */}
              <div className="space-y-5">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {t('currently.location')} • {t('currently.role')}
                </p>
                <div className="flex items-center gap-5 pt-2">
                  <p className="text-gray-400 text-sm pl-4 border-l border-gray-500/40">
                    {t('currently.openToProjects')}
                  </p>
                  <InteractiveHoverButton
                    onClick={() => {
                      const resumeFile = currentLanguage === 'pt'
                        ? '/assets/resume/Jorge_Matheus_Molina_David_Currículo.pdf'
                        : '/assets/resume/Jorge_Matheus_Molina_David_Resume.pdf';

                      const downloadName = currentLanguage === 'pt'
                        ? 'Jorge_Matheus_Molina_David_Currículo.pdf'
                        : 'Jorge_Matheus_Molina_David_Resume.pdf';

                      const link = document.createElement('a');
                      link.href = resumeFile;
                      link.download = downloadName;
                      link.target = '_blank';
                      link.rel = 'noopener noreferrer';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-xs bg-black/40 border-gray-600/50 text-gray-300 hover:border-gray-400 px-4 py-1.5"
                    title={t('resume.downloadButton', 'Download PDF')}
                  >
                    <span className="hidden sm:inline">{t('resume.title', 'Resume')}</span>
                    <span className="sm:hidden">PDF</span>
                  </InteractiveHoverButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DomeGallery - Bottom Section Full Width - tamanho otimizado */}
        <div className="w-full overflow-visible">
          <DomeGalleryCard
            photos={photos}
            title={t('gallery.title', 'Photo Gallery')}
            className="h-[600px] md:h-[700px] lg:h-[750px] overflow-visible"
          />
        </div>

      </div>

    </section>
  );
};

export default About;