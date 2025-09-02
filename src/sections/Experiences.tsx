import { Timeline } from "../components/Timeline";
import { Particles } from "../components/Particles";
import { useLanguage } from "../contexts/LanguageContext";
import { useEffect } from "react";

const Experiences: React.FC = () => {
  const { setLanguage } = useLanguage();
  
  // Set English as default language only on first visit, without overriding user choice
  useEffect(() => {
    // Only set to English if no language preference exists yet
    if (!localStorage.getItem('portfolio_language')) {
      setLanguage('en');
    }
  }, []); // Empty dependency array - runs only once on mount
  return (
    <div className="relative w-full">
      <Particles
        className="absolute inset-0 -z-50"
        quantity={100}
        ease={80}
        color={"#ffffff"}
        refresh
      />
      <Timeline useTranslatedData={true} />
    </div>
  );
};

export default Experiences;