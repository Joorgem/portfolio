import React from "react";
import ProjectShowcase from "../components/ProjectShowcase";
import { myProjects } from "../constants";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Projects: React.FC = () => {
  const { t } = useTranslation("projects");
  const projectsData = {
    sectionTitle: t("sectionTitle"),
    sectionSubtitle: t("sectionSubtitle"),
    scrollText: t("scrollText"),
    labels: {
      technologies: t("labels.technologies"),
      links: t("labels.links"),
      viewProject: t("labels.viewProject"),
      code: t("labels.code"),
      viewDetails: t("labels.viewDetails"),
      projectDetails: t("labels.projectDetails"),
    },
    projects: t("projects", { returnObjects: true }) as any[],
  };

  return (
    <section className="relative bg-transparent w-full">
      <div className="relative z-10 min-h-screen flex flex-col justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
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

      <div className="relative z-10">
        {myProjects.map((project, index) => {
          const translatedProject = (projectsData.projects as any[])[index] || {
            title: project.title,
            subDescription: project.subDescription,
            tags: project.tags,
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

      <div className="relative z-10 py-16" />
    </section>
  );
};

export default Projects;
