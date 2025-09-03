import { useTranslation } from "react-i18next";
import { Particles } from "../components/Particles";

interface CourseCardProps {
  title: string;
  institution: string;
  period: string;
  description: string;
  type: 'course' | 'certification' | 'extracurricular';
  technologies?: string[];
  link?: string;
  logo: string;
  index: number;
  typeLabels: {
    course: string;
    certification: string;
    extracurricular: string;
  };
  coursesData: any[];
}

const CourseCard: React.FC<CourseCardProps> = ({ 
  title, 
  institution, 
  period, 
  description, 
  type, 
  technologies,
  link,
  logo,
  index,
  typeLabels,
  coursesData
}) => {
  const typeConfig = {
    course: {
      label: typeLabels.course,
      accent: 'from-black/40 to-gray-900/30',
      badge: 'bg-gray-800/60 border-gray-700/80'
    },
    certification: {
      label: typeLabels.certification, 
      accent: 'from-gray-900/40 to-black/30',
      badge: 'bg-gray-700/60 border-gray-600/80'
    },
    extracurricular: {
      label: typeLabels.extracurricular,
      accent: 'from-gray-800/30 to-black/40', 
      badge: 'bg-gray-600/50 border-gray-500/70'
    }
  };

  const config = typeConfig[type];
  const isEven = index % 2 === 0;

  return (
    <div className={`flex items-center gap-4 md:gap-6 group ${!isEven ? 'md:flex-row-reverse' : ''}`}>
      {/* Timeline Connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-aqua/60 to-mint/40 border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
        {index < coursesData.length - 1 && (
          <div className="w-px h-16 md:h-24 bg-gradient-to-b from-white/20 to-transparent mt-2" />
        )}
      </div>
      
      {/* Course Card */}
      <div 
        className={`
          relative w-full max-w-lg cursor-pointer p-4 md:p-6 rounded-2xl 
          bg-gradient-to-br ${config.accent}
          backdrop-blur-lg border border-white/10 
          hover:border-white/30 hover:-translate-y-1 
          transition-all duration-300 group-hover:shadow-2xl
          group-hover:shadow-white/5
          ${!isEven ? 'md:text-right' : ''}
        `}
        onClick={() => link && window.open(link, '_blank')}
      >
        {/* Course Header */}
        <div className={`flex items-start gap-3 md:gap-4 mb-4 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
          <img
            className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-black/20 p-1.5 md:p-2 object-contain flex-shrink-0"
            src={logo}
            alt={`${title} logo`}
          />
          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2 py-1 md:px-3 md:py-1 text-xs font-medium rounded-full border ${config.badge} text-white/90 mb-2`}>
              {config.label}
            </span>
            <h3 className="text-base md:text-lg font-semibold text-white mb-1 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-white/70 font-medium truncate">{institution}</p>
            <p className="text-xs text-white/50 mt-1">{period}</p>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-white/80 leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
        
        {/* Technologies */}
        {technologies && technologies.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 md:gap-2 ${!isEven ? 'md:justify-end' : ''}`}>
            {technologies.slice(0, 3).map((tech, techIndex) => (
              <span 
                key={techIndex}
                className="px-2 py-1 text-xs bg-black/20 text-white/70 rounded-md border border-white/10"
              >
                {tech}
              </span>
            ))}
            {technologies.length > 3 && (
              <span className="px-2 py-1 text-xs bg-black/20 text-white/50 rounded-md border border-white/10">
                +{technologies.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Glassmorphism overlay on hover */}
        <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

const Courses: React.FC = () => {
  const { t } = useTranslation('courses');
  const coursesData = t('courses', { returnObjects: true }) as any[];
  const typeLabels = t('typeLabels', { returnObjects: true }) as any;

  return (
    <section className="relative min-h-screen flex flex-col justify-center c-space py-12 md:py-20">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      
      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6 md:space-y-8">
          {coursesData.map((course, index) => (
            <CourseCard 
              key={`${course.title}-${index}`} 
              {...course} 
              index={index}
              typeLabels={typeLabels}
              coursesData={coursesData}
            />
          ))}
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="hidden md:block absolute top-20 left-10 w-2 h-2 bg-aqua/40 rounded-full animate-pulse" />
      <div className="hidden md:block absolute bottom-32 right-16 w-1 h-1 bg-mint/60 rounded-full animate-pulse" />
      <div className="hidden md:block absolute top-1/3 right-8 w-1.5 h-1.5 bg-lavender/40 rounded-full animate-pulse" />
    </section>
  );
};

export default Courses;