import { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import { myProjects } from "../constants";
import { motion } from "framer-motion";
import { Particles } from "../components/Particles";

const ProjectsSection: React.FC = () => {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  return (
    <section className="relative bg-black">
      {/* Space background */}
      <div className="fixed inset-0 -z-10">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color={"#ffffff"}
          refresh
        />
        
        {/* Depth gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        
        {/* Animated stars */}
        <div className="stars-background" />
      </div>
      
      {/* Section header */}
      <div className="relative py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore my universe of digital creations
          </p>

          {/* Scroll hint */}
          <motion.div
            className="mt-8 inline-flex items-center gap-2 text-green-400 text-sm"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Scroll to explore</span>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Projects List */}
      <div className="relative">
        {myProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            {...project}
            index={index}
            isExpanded={expandedProject === project.id}
            onToggleExpand={() => 
              setExpandedProject(expandedProject === project.id ? null : project.id)
            }
          />
        ))}
      </div>

      {/* Footer */}
      <div className="relative py-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-gray-500"
        >
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-4" />
          <p className="text-sm">✨ End of the journey ✨</p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;