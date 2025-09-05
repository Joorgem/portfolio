import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Particles } from "../components/Particles";
import LogoLoop from "../components/LogoLoop";
import DomeGalleryCard from "../components/DomeGalleryCard";
import { personalPhotos, placeholderPhotos } from "../data/personalPhotos";
import { 
  SiReact, 
  SiNextdotjs, 
  SiTypescript, 
  SiNodedotjs,
  SiPython,
  SiTailwindcss,
  SiDocker,
  SiPostgresql,
  SiMongodb,
  SiExpress,
  SiJavascript,
  SiOpenai,
  SiHuggingface,
  SiRedis,
  SiMysql,
  SiFirebase,
  SiApachespark,
  SiAmazonwebservices,
  SiGooglecloud,
  SiApache
} from 'react-icons/si';

const About: React.FC = () => {
  const { t } = useTranslation('about');
  const techLogos = useMemo(() => [
    { node: <SiNextdotjs className="text-2xl text-gray-400" />, title: "Next.js" },
    { node: <SiReact className="text-2xl text-gray-400" />, title: "React" },
    { node: <SiTypescript className="text-2xl text-gray-400" />, title: "TypeScript" },
    { node: <SiNodedotjs className="text-2xl text-gray-400" />, title: "Node.js" },
    { node: <SiPython className="text-2xl text-gray-400" />, title: "Python" },
    { node: <SiTailwindcss className="text-2xl text-gray-400" />, title: "Tailwind CSS" },
    { node: <SiDocker className="text-2xl text-gray-400" />, title: "Docker" },
    { node: <SiPostgresql className="text-2xl text-gray-400" />, title: "PostgreSQL" },
    { node: <SiMongodb className="text-2xl text-gray-400" />, title: "MongoDB" },
    { node: <SiExpress className="text-2xl text-gray-400" />, title: "Express" },
    { node: <SiJavascript className="text-2xl text-gray-400" />, title: "JavaScript" },
    { node: <SiOpenai className="text-2xl text-gray-400" />, title: "OpenAI" },
    { node: <SiHuggingface className="text-2xl text-gray-400" />, title: "Hugging Face" },
    { node: <SiRedis className="text-2xl text-gray-400" />, title: "Redis" },
    { node: <SiMysql className="text-2xl text-gray-400" />, title: "MySQL" },
    { node: <SiFirebase className="text-2xl text-gray-400" />, title: "Firebase" },
    { node: <SiApachespark className="text-2xl text-gray-400" />, title: "Apache Spark" },
    { node: <SiAmazonwebservices className="text-2xl text-gray-400" />, title: "AWS" },
    { node: <SiGooglecloud className="text-2xl text-gray-400" />, title: "Google Cloud" },
    { node: <SiApache className="text-2xl text-gray-400" />, title: "Apache" },
  ], []);

  // Usa suas fotos pessoais ou fotos de teste se não houver nenhuma
  const photos = useMemo(() => personalPhotos.length > 0 ? personalPhotos : placeholderPhotos, []);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - DomeGallery Card */}
          <div className="relative">
            <DomeGalleryCard
              photos={photos}
              title={t('gallery.title', 'Photo Gallery')}
              className="h-full"
            />
          </div>

          {/* Right Column - Info Cards */}
          <div className="flex flex-col gap-6 h-full">
            {/* Tech Stack Card */}
            <div className="group relative p-8 flex-1 min-h-[240px] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
              <div className="relative z-10 h-full flex flex-col">
                <h3 className="text-2xl font-semibold text-gray-100 mb-6">
                  {t('techStack.title', 'Tech Stack')}
                </h3>
                <div className="flex-grow">
                  <LogoLoop
                    logos={techLogos}
                    speed={30}
                    direction="left"
                    logoHeight={24}
                    gap={32}
                    pauseOnHover={true}
                    fadeOut={true}
                    fadeOutColor="#000000"
                    scaleOnHover={true}
                    className="py-2"
                  />
                </div>
              </div>
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
            </div>

            {/* Currently Card */}
            <div className="group relative p-8 flex-1 min-h-[240px] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-100 mb-4">
                    {t('currently.title')}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {t('currently.location')} • {t('currently.role')}
                    </p>
                    <p className="text-gray-400 text-sm pl-4 border-l border-gray-600/30">
                      {t('currently.openToProjects')}
                    </p>
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