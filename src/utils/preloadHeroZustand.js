// PRODUCTION FIX: Smart preloading utility to prevent race conditions
// Separate file to maintain Fast Refresh compatibility

let HeroZustandPromise = null;

export const preloadHeroZustand = () => {
  if (!HeroZustandPromise) {
    HeroZustandPromise = import("../sections/HeroZustand");
  }
  return HeroZustandPromise;
};