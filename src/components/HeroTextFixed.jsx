import { FlipWords } from "./FlipWords";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "../stores/navigation.store";

const HeroTextFixed = () => {
  const words = ["Secure", "Modern", "Scalable"];
  const navigationState = useNavigationStore(state => state.navigationState);
  const fadeProgress = useNavigationStore(state => state.fadeProgress);
  
  // Esconde texto quando navegando ou em seção
  const shouldShow = navigationState === 'idle' || navigationState === 'orbiting';
  const opacity = shouldShow ? Math.max(0, 1 - fadeProgress) : 0;
  
  const variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  };
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div 
          className="absolute top-0 left-0 z-10 p-8 md:p-12 pointer-events-none"
          style={{ position: 'absolute' }}
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Desktop View */}
          <div className="hidden md:block">
            <motion.h1
              className="text-4xl font-medium text-white mb-4"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.5 }}
            >
              Hi I'm Jorge
            </motion.h1>
            <div className="space-y-2">
              <motion.p
                className="text-5xl font-medium text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.7 }}
              >
                A Developer <br /> Dedicated to Crafting
              </motion.p>
              <motion.div
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1 }}
              >
                <FlipWords
                  words={words}
                  className="font-black text-white text-7xl md:text-8xl"
                />
              </motion.div>
              <motion.p
                className="text-4xl font-medium text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1.3 }}
              >
                Web Solutions
              </motion.p>
            </div>
          </div>
          
          {/* Mobile View */}
          <div className="block md:hidden">
            <motion.p
              className="text-3xl font-medium text-white mb-4"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.5 }}
            >
              Hi, I'm Jorge
            </motion.p>
            <div className="space-y-2">
              <motion.p
                className="text-4xl font-black text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 0.7 }}
              >
                Building
              </motion.p>
              <motion.div
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1 }}
              >
                <FlipWords
                  words={words}
                  className="font-bold text-white text-6xl"
                />
              </motion.div>
              <motion.p
                className="text-3xl font-black text-neutral-300"
                variants={variants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: 1.3 }}
              >
                Web Applications
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroTextFixed;