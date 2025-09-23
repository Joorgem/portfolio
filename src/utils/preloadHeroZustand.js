// PRODUCTION FIX: Smart preloading utility to prevent race conditions
// Separate file to maintain Fast Refresh compatibility

let HeroZustandPromise = null;
let isPreloading = false;

export const preloadHeroZustand = () => {
  if (!HeroZustandPromise && !isPreloading) {
    isPreloading = true;
    HeroZustandPromise = import("../sections/HeroZustand").finally(() => {
      isPreloading = false;
    });
  }
  return HeroZustandPromise;
};