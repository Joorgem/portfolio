import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Particles } from "../components/Particles";
import { IconCloud } from "../components/magicui/icon-cloud";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import DomeGalleryCard from "../components/DomeGalleryCard";
import { personalPhotos, placeholderPhotos } from "../data/personalPhotos";
import { FileText, Download } from "lucide-react";

const About: React.FC = () => {
  const { t } = useTranslation('about');
  
  // Array de imagens dos logos de tecnologias para o IconCloud
  const techLogosImages = useMemo(() => [
    // Frontend & Core Technologies
    "/assets/logos/nextjs.check.svg",
    "/assets/logos/react.svg", 
    "/assets/logos/typescript.svg",
    "/assets/logos/javascript.svg",
    "/assets/logos/tailwindcss.svg",
    "/assets/logos/html5.svg",
    "/assets/logos/css3.svg",
    
    // Backend & Languages
    "/assets/logos/python.svg",
    "/assets/logos/nodejs.svg",
    
    // Databases
    "/assets/logos/postgresql.svg",
    "/assets/logos/mongodb.svg",
    
    // 3D & Animations
    "/assets/logos/three.js.svg",
    
    // Tools & Development
    "/assets/logos/git.svg",
    "/assets/logos/github-white.svg",
    "/assets/logos/visualstudiocode.svg",
    "/assets/logos/vitejs.svg",
    "/assets/logos/docker.svg",
    "/assets/logos/figma.svg",
    "/assets/logos/blender-devicon.svg",
    
    // Cloud & Services
    "/assets/logos/azure.svg",
    "/assets/logos/amazonwebservices.svg",
    "/assets/logos/googlecloud.svg",
    "/assets/logos/stripe.svg"
  ], []);

  // Usar fotos reais do Google Drive
  const photos = useMemo(() => {
    // Usar as fotos configuradas do Google Drive
    return personalPhotos.length > 0 ? personalPhotos : placeholderPhotos;
  }, []);

  return (
    <section className="relative c-space min-h-screen overflow-visible" id="about">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      
      {/* Main Content Grid */}
      <div className="mt-12 mb-8 overflow-visible">
        {/* Currently Card - Top Section */}
        <div className="mb-6">
          <div className="group relative p-6 rounded-2xl bg-transparent transition-all duration-300">
            <div className="relative">
              {/* Header with title */}
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-100">
                  {t('currently.title')}
                </h3>
              </div>
              
              {/* Content area with status information */}
              <div className="space-y-4">
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {t('currently.location')} • {t('currently.role')}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-gray-400 text-sm pl-4 border-l border-gray-600/30">
                    {t('currently.openToProjects')}
                  </p>
                  <InteractiveHoverButton
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/assets/resume/JorgeMatheusMolinaDavid_Currículo.pdf';
                      link.download = 'Jorge_Molina_Resume.pdf';
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