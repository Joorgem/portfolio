import React from "react";
import ProjectShowcase from "../components/ProjectShowcase";
import { myProjects } from "../constants";
import { motion } from "framer-motion";
import { Particles } from "../components/Particles";
import { useLanguage } from "../contexts/LanguageContext";
import { useTranslations } from "../locales/translations";

const Projects: React.FC = () => {
  const { language } = useLanguage();
  const translations = useTranslations(language);
  const projectsData = translations.projects;

  return (
    <section className="relative bg-black">
      {/* Background with particles - behind content */}
      <div className="fixed inset-0 z-0">
        <Particles
          className="absolute inset-0 w-full h-full"
          quantity={100}
          ease={80}
          color={"#ffffff"}
          refresh
        />
      </div>
      
      {/* Minimalist Header - Full Screen */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {projectsData.sectionTitle}
            </span>
          </h2>
          
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {projectsData.sectionSubtitle}
          </p>
        </motion.div>

      </div>
      
      {/* Projects List with new minimalist design */}
      <div className="relative z-10">
        {myProjects.map((project, index) => {
          const translatedProject = projectsData.projects[index] || {
            title: project.title,
            subDescription: project.subDescription,
            tags: project.tags
          };
          
          return (
            <ProjectShowcase
              key={project.id}
              {...project}
              title={translatedProject.title}
              subDescription={translatedProject.subDescription}
              tags={translatedProject.tags}
              index={index}
              labels={projectsData.labels}
            />
          );
        })}
      </div>

      {/* Minimalist Footer */}
      <div className="relative z-10 py-32 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
          <p className="text-sm text-gray-500 font-light tracking-widest uppercase">
            {projectsData.endText}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;