import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Particles } from "../components/Particles";
import LogoLoop from "../components/LogoLoop";
import DomeGallery from "../components/DomeGallery";
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
  SiJavascript
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
      
      {/* Large 3D Photo Gallery - Full Sphere Visible */}
      <div className="mt-12 mb-8">
        <div className="relative p-8 h-[800px] md:h-[900px]">
          {/* 3D Photo Dome Container - Full Height */}
          <div className="relative z-10 h-full flex items-end pb-40">
            <DomeGallery
              photos={photos}
              fit={window.innerWidth < 768 ? 0.45 : 0.75}
              minRadius={window.innerWidth < 768 ? 400 : 900}
              maxVerticalRotation={34}
              segments={window.innerWidth < 768 ? 28 : 42}
              dragDampening={0.9}
              grayscale={false}
              overlayBlurColor="transparent"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Grid 1 - What Moves Me */}
        <div className="group relative p-8 md:col-span-2 h-[14rem] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-gray-100 mb-6">
              {t('whatMovesMe.title')}
            </h3>
            <div className="flex-grow flex items-center">
              <div className="w-full space-y-3">
                <div className="text-sm text-gray-300 leading-relaxed">
                  {t('whatMovesMe.items.learn')}
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {t('whatMovesMe.items.exercise')}
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {t('whatMovesMe.items.nutrition')}
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {t('whatMovesMe.items.people')}
                </div>
              </div>
            </div>
          </div>
          {/* Subtle accent line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
        </div>

        {/* Grid 2 - Currently */}
        <div className="group relative p-8 md:col-span-2 h-[14rem] rounded-2xl bg-black/20 backdrop-blur-md border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 to-black/30 rounded-2xl"></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4">
                {t('currently.title')}
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                {t('currently.location')} • {t('currently.role')}
              </p>
              <p className="text-gray-400 text-xs">
                {t('currently.scope')}
              </p>
            </div>
          </div>
          {/* Subtle accent line */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default About;