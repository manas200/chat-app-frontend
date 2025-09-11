import React, { useState, useEffect } from "react";
import Head from "next/head";

const TypewriterText: React.FC = () => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const phrases = [
    "Connect. Chat. Care.",
    "Real-time messaging.",
    "Secure conversations.",
    "Built with modern tech.",
    "Talk Without Limits.",
    "Scalable. Reliable. Fast.",
  ];

  // Typing speed variables
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 1500;

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (!isDeleting && currentIndex < currentPhrase.length) {
      // Typing forward
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + currentPhrase[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else if (!isDeleting && currentIndex === currentPhrase.length) {
      // Pause at the end of typing
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);

      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex > 0) {
      // Deleting
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => prev - 1);
      }, deletingSpeed);

      return () => clearTimeout(timeout);
    } else if (isDeleting && currentIndex === 0) {
      // Move to next phrase after deleting
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }
  }, [currentIndex, isDeleting, currentPhraseIndex, phrases]);

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <section className="py-16 px-6 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-400 mb-8 font-exo">
              Powered by modern technology
            </h3>

            <div className="relative inline-block">
              <div className="text-4xl md:text-5xl font-bold text-gray-200 mb-4 min-h-[60px] flex items-center justify-center font-exo tracking-wide">
                {currentText}
                <span className="ml-1 inline-block h-12 w-1 bg-blue-500 animate-pulse"></span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-full blur-xl opacity-30"></div>
            </div>
          </div>

          {/* Tech badges - simplified version */}
          <div className="flex flex-wrap justify-center gap-6 mt-16">
            {[
              "React",
              "Node.js",
              "MongoDB",
              "Redis",
              "Docker",
              "WebSockets",
            ].map((tech) => (
              <div
                key={tech}
                className="px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm font-exo"
              >
                <span className="text-sm text-gray-300">{tech}</span>
              </div>
            ))}
          </div>
        </div>

        <style jsx global>{`
          .font-orbitron {
            font-family: "Orbitron", sans-serif;
          }
        `}</style>
      </section>
    </>
  );
};

export default TypewriterText;
