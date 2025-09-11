import React from "react";
import { ArrowRight, MessageCircle, Users, Zap } from "lucide-react";
import ChatPreview from "./ChatPreview";

interface HeroSectionProps {
  onSignupClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSignupClick }) => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Real-time messaging reimagined
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  Chat that keeps
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  your world in sync
                </span>
              </h1>

              <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                "A modern chat app with real-time messaging and strong security,
                built for seamless communication."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onSignupClick}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-2xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-500/25 flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Powered by Microservices</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400">Real-time end-to-end Chat</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <ChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
