import React from "react";
import { MessageCircle, Zap } from "lucide-react";

interface NavbarProps {
  onSignupClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSignupClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pulse
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-gray-300 hover:text-white transition-colors duration-200">
              How it's made
            </button>
            <button
              onClick={onSignupClick}
              className="px-7 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-full text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
