import React from "react";
import { MessageCircle, Zap, Twitter, Github, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="border-t border-white/10 mt-8 pt-5 pb-5 text-center">
        <p className="text-gray-400 text-sm">
          © 2025 Pulse. Built with ❤️ for modern communication.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
