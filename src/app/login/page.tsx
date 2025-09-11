"use client";
import Loading from "@/components/Loading";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import {
  ArrowRight,
  Loader2,
  Zap,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { isAuth, loading: userLoading } = useAppData();

  const handleSubmit = async (
    e: React.FormEvent<HTMLElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });

      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return <Loading />;
  if (isAuth) return redirect("/chat");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row overflow-hidden">
      {/* App Logo - Show on mobile and desktop */}
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-2">
          <Zap size={20} className="text-white" fill="currentColor" />
        </div>
        <span className="text-xl font-bold text-white">Pulse</span>
      </div>

      {/* Back button for mobile */}
      <button
        className="lg:hidden absolute top-6 right-6 flex items-center text-gray-400 hover:text-white transition-colors z-10"
        onClick={() => router.push("/")}
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      {/* Left side - Form (100% on mobile, 40% on desktop) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center py-12 px-6 lg:px-12">
        <div className="w-full max-w-md mx-auto mt-8 lg:mt-0">
          <div className="text-center mb-8 lg:mb-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Welcome to Pulse
            </h1>
            <p className="text-gray-400 text-sm lg:text-base">
              Enter your email to continue your journey
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="text-center">
                <p className="text-xs lg:text-sm text-gray-500">
                  By continuing, you agree to our{" "}
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical separator line - Hidden on mobile */}
      <div className="hidden lg:block h-screen w-px bg-gray-800"></div>

      {/* Right side - Illustration (Hidden on mobile, 60% on desktop) */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-center items-center p-8 lg:p-12 bg-gradient-to-br from-gray-900 to-gray-950 relative">
        {/* Animated messaging illustration */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            {/* Main chat illustration */}
            <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl p-6 mb-6 transform rotate-2">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex-shrink-0"></div>
                <div className="bg-gray-700 rounded-lg rounded-tl-none p-3">
                  <p className="text-gray-200 text-sm">
                    Hey there! 👋 Ready to chat?
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 justify-end mb-4">
                <div className="bg-blue-600 rounded-lg rounded-tr-none p-3 max-w-xs">
                  <p className="text-white text-sm">
                    Absolutely! This app looks amazing!
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex-shrink-0"></div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex-shrink-0"></div>
                <div className="bg-gray-700 rounded-lg rounded-tl-none p-3">
                  <p className="text-gray-200 text-sm">
                    Wait until you see the real-time features! 🚀
                  </p>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-600/10 rounded-full backdrop-blur-sm"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-cyan-600/10 rounded-full backdrop-blur-sm"></div>

            {/* Icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"></div>
                <MessageCircle
                  size={48}
                  className="relative text-blue-400 mx-auto"
                />
              </div>
            </div>
          </div>

          {/* Feature text */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Real-time messaging made simple
            </h2>
            <p className="text-gray-400">
              Connect with your team and friends through secure, fast messaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
