import React from "react";
import { MessageSquare, Zap, Share2, MonitorSmartphone } from "lucide-react";

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Real-time Messaging",
      description:
        "Instant message delivery with typing indicators and read receipts",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      borderGradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Zap,
      title: "Quick OTP Signup",
      description:
        "Get started in seconds with our lightning-fast OTP verification",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderGradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: Share2,
      title: "File Sharing",
      description:
        "Share documents, images, and files seamlessly with drag & drop",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      borderGradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: MonitorSmartphone,
      title: "Modern UI",
      description:
        "A sleek, responsive design that works seamlessly across devices",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10",
      borderGradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why choose Pulse?
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Built for modern teams who need speed, security, and simplicity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative p-8 rounded-3xl bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm border border-transparent bg-clip-padding transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                borderImage: `linear-gradient(135deg, ${feature.borderGradient}) 1`,
              }}
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
