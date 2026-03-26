import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Github, Linkedin, Mail, ArrowDown, ExternalLink } from "lucide-react";
import { FlipWords } from "../components/FlipWords";
import { InteractiveHoverButton } from "../components/magicui/interactive-hover-button";
import TechStackCarousel from "../components/TechStackCarousel";
import DomeGalleryCard from "../components/DomeGalleryCard";
import { personalPhotos, placeholderPhotos } from "../data/personalPhotos";
import { useNavigationStore } from "../stores/navigation.store";
import { PortfolioModes } from "../constants/navigationConfig";

const About: React.FC = () => {
  const { t, i18n } = useTranslation("about");
  const currentLanguage = i18n.language;
  const portfolioMode = useNavigationStore((state) => state.portfolioMode);

  const photos = useMemo(() => {
    return personalPhotos.length > 0 ? personalPhotos : placeholderPhotos;
  }, []);

  const techStackLogos = [
    { name: "React", src: "/assets/logos/react.svg" },
    { name: "Python", src: "/assets/logos/python.svg" },
    { name: "TypeScript", src: "/assets/logos/typescript.svg" },
    { name: "Node.js", src: "/assets/logos/nodejs.svg" },
    { name: "AWS", src: "/assets/logos/amazonwebservices.svg" },
    { name: "Docker", src: "/assets/logos/docker.svg" },
    { name: "PostgreSQL", src: "/assets/logos/postgresql.svg" },
    { name: "MongoDB", src: "/assets/logos/mongodb.svg" },
    { name: "Next.js", src: "/assets/logos/nextjs.check.svg" },
    { name: "Three.js", src: "/assets/logos/three.js.svg" },
    { name: "JavaScript", src: "/assets/logos/javascript.svg" },
    { name: "HTML5", src: "/assets/logos/html5.svg" },
    { name: "CSS3", src: "/assets/logos/css3.svg" },
    { name: "Tailwind CSS", src: "/assets/logos/tailwindcss.svg" },
    { name: "Git", src: "/assets/logos/git.svg" },
    { name: "GitHub", src: "/assets/logos/github-white.svg" },
    { name: "Figma", src: "/assets/logos/figma.svg" },
    { name: "VS Code", src: "/assets/logos/visualstudiocode.svg" },
    { name: "Google Cloud", src: "/assets/logos/googlecloud.svg" },
    { name: "Azure", src: "/assets/logos/azure.svg" },
    { name: "Vite", src: "/assets/logos/vitejs.svg" },
    { name: "Blender", src: "/assets/logos/blender-devicon.svg" },
    {
      name: "Cloudflare",
      src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg",
    },
  ];

  return (
    <section className="relative bg-transparent w-full" id="about">
      <div className="relative z-10 min-h-screen flex flex-col justify-center text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          <motion.h1
            id="main-name"
            className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70">
              {t("name")}
            </span>
          </motion.h1>

          <motion.div
            className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <FlipWords
              words={
                t("hero.taglineWords", { returnObjects: true }) as string[]
              }
              duration={3000}
              className="text-white font-medium"
            />
          </motion.div>

          <motion.p
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.a
              href="https://www.linkedin.com/in/jorge-molinadavid/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("social.linkedin")}
              title={t("social.linkedin")}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 border border-white/20 rounded-full hover:border-white/40 transition-all duration-300 hover:bg-white/5"
            >
              <Linkedin
                size={24}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              />
            </motion.a>

            <motion.a
              href="https://github.com/Joorgem"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("social.github")}
              title={t("social.github")}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 border border-white/20 rounded-full hover:border-white/40 transition-all duration-300 hover:bg-white/5"
            >
              <Github
                size={24}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              />
            </motion.a>

            <motion.a
              href="mailto:contato@jorgemolina.dev"
              aria-label={t("social.email")}
              title={t("social.email")}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 border border-white/20 rounded-full hover:border-white/40 transition-all duration-300 hover:bg-white/5"
            >
              <Mail
                size={24}
                className="text-gray-300 hover:text-white transition-colors duration-300"
              />
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center text-white/60"
          >
            <ArrowDown size={20} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {t("techStackPreview.title")}
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              {t("techStackPreview.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <TechStackCarousel techStack={techStackLogos} />
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={() => {
                const element = document.getElementById("section-experience");
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 text-lg font-medium group"
            >
              {t("techStackPreview.seeAllLink")}
              <ExternalLink
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 sm:p-12 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ borderColor: "rgba(255, 255, 255, 0.12)" }}
          >
            <div className="text-center">
              <motion.div
                className="flex items-center justify-center gap-3 mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {t("currently.title")}
                </h3>
              </motion.div>

              <motion.p
                className="text-lg sm:text-xl text-gray-200 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {t("currently.role")} • {t("currently.location")}
              </motion.p>

              <motion.p
                className="text-gray-400 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {t("currently.status")} • {t("currently.openToProjects")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <InteractiveHoverButton
                  onClick={() => {
                    const resumeFile =
                      "/assets/resume/JorgeMolina_AI_Data_Engineer_CV.pdf";
                    const downloadName = "JorgeMolina_AI_Data_Engineer_CV.pdf";

                    const link = document.createElement("a");
                    link.href = resumeFile;
                    link.download = downloadName;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="border border-white/30 text-white hover:border-white hover:bg-white/5 px-8 py-3 text-base font-medium"
                  title={t("resume.downloadButton")}
                >
                  {t("resume.downloadButton")}
                </InteractiveHoverButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {portfolioMode === PortfolioModes.THREE_D && (
        <motion.div
          className="relative z-10 py-24 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Photo Gallery
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                A glimpse into my world beyond code
              </p>
            </motion.div>

            <motion.div
              className="w-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <DomeGalleryCard
                photos={photos}
                title=""
                className="h-[600px] md:h-[700px] lg:h-[750px] overflow-hidden"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default About;
