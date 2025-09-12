"use client";
import axios from "axios";
import { ArrowRight, ChevronLeft, Loader2, Lock, Mail } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const VerifyOtp = () => {
  const {
    isAuth,
    setIsAuth,
    setUser,
    loading: userLoading,
    fetchChats,
    fetchUsers,
  } = useAppData();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const patedData = e.clipboardData.getData("text");
    const digits = patedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please Enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/verify`, {
        email,
        otp: otpString,
      });
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });
      toast.success(data.message);
      setTimer(60);
    } catch (error: any) {
      setError(error.response.data.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (userLoading) return <Loading />;
  if (isAuth) redirect("/chat");

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full lg:w-[40%] flex flex-col justify-center py-12 px-6 lg:px-12 relative">
        {/* App Logo and Back Button */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-2">
              <Lock size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Pulse</span>
          </div>
          <button
            className="flex items-center text-gray-400 hover:text-white transition-colors"
            onClick={() => router.push("/login")}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-white mt-7 mb-3">
              Verify Your Email
            </h1>
            <p className="text-gray-400 mb-2">We have sent a 6-digit code to</p>
            <p className="text-blue-400 font-medium break-all">{email}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                  Enter your 6 digit code here
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      placeholder={"123456"[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-12 text-center text-xl font-semibold border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
                  <p className="text-red-300 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>Verify</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-400 text-sm mb-2">
                Didn't receive the code?
              </p>
              {timer > 0 ? (
                <p className="text-gray-500 text-sm">
                  Resend code in {timer} seconds
                </p>
              ) : (
                <button
                  className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 transition-colors"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical separator line - Desktop only */}
      <div className="hidden lg:block h-screen w-px bg-gray-800"></div>

      {/* Right side - Illustration (60%) - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-[60%] flex-col justify-center items-center p-12 bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="max-w-md mx-auto">
          {/* Tips - Modern card style */}
          <div className="mt-8 bg-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-2xl p-6">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-blue-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-2xl p-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-lg"></div>
                    <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4">
                      <Lock size={48} className="text-white" />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-white text-center mb-4">
                  Secure Verification
                </h2>
                <p className="text-gray-400 text-center">
                  Your security is our priority. This code ensures only you can
                  access your account.
                </p>
              </div>
            </div>
            <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                Verification Tips :
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  Check your spam folder if you don't see the email
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  The code will expire in 5 minutes for security
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">•</span>
                  Enter the code quickly to avoid having to request a new one
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
