import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import TechStackStrip from "./TechStackStrip";
import Footer from "./Footer";

interface LandingPageProps {
  onSignupClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignupClick }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar onSignupClick={onSignupClick} />
      <HeroSection onSignupClick={onSignupClick} />
      <FeaturesSection />
      <TechStackStrip />
      <Footer />
    </div>
  );
};

export default LandingPage;
