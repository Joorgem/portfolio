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
    <section className="relative c-space min-h-screen" id="about">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      
      {/* Main Content Grid */}
      <div className="mt-12 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
          {/* Left Column - DomeGallery Card */}
          <div className="relative order-1 lg:order-1">
            <DomeGalleryCard
              photos={photos}
              title={t('gallery.title', 'Photo Gallery')}
              className="h-[400px] md:h-[450px] lg:h-full"
            />
          </div>

          {/* Right Column - Info Cards */}
          <div className="flex flex-col gap-6 h-full order-2 lg:order-2">
            {/* Currently Card with Integrated Resume */}
            <div className="group relative p-6 rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
              <div className="relative z-10 h-full">
                {/* Header with title and resume button */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-gray-100">
                    {t('currently.title')}
                  </h3>
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
                
                {/* Content area with status information */}
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    {t('currently.location')} • {t('currently.role')}
                  </p>
                  <p className="text-gray-400 text-sm pl-4 border-l border-gray-600/30">
                    {t('currently.openToProjects')}
                  </p>
                </div>
              </div>
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
            </div>

            {/* Tech Stack Card */}
            <div className="group relative p-8 flex-1 min-h-[280px] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
              <div className="relative z-10 h-full">
                <div className="flex items-center justify-center h-full">
                  <div className="relative overflow-hidden">
                    <IconCloud images={techLogosImages} />
                  </div>
                </div>
              </div>
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

export default About;