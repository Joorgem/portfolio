import React from "react";
import Navbar from "./sections/navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Projects from "./sections/Projects";
import Experiences from "./sections/Experiences";
import Testimonial from "./sections/Testimonial";
import Contact from "./sections/Contact";
import Footer from './sections/Footer';

const App = () => {
  return (
    <div className="bg-black h-screen w-screen fixed inset-0 overflow-hidden">
      <Hero />
      {/* Seções removidas - serão acessadas via navegação 3D */}
      {/* 
      <div className="relative z-10">
        <Navbar />
        <About />
        <Projects />
        <Experiences />
        <Testimonial />
        <Contact />
        <Footer/>
      </div>
      */}
    </div>
  );
};

export default App;
