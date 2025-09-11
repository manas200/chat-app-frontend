import React, { useState } from "react";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import EmailStep from "./signup/EmailStep";
import OTPStep from "./signup/OTPStep";
import SuccessStep from "./signup/SuccessStep";
import SignupIllustration from "./signup/SignupIllustration";

interface SignupPageProps {
  onBackClick: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBackClick }) => {
  const [currentStep, setCurrentStep] = useState<"email" | "otp" | "success">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (emailValue: string) => {
    setEmail(emailValue);
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setCurrentStep("otp");
  };

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setCurrentStep("success");
  };

  const handleBackToEmail = () => {
    setCurrentStep("email");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex">
      {/* Back Button */}
      <button
        onClick={onBackClick}
        className="fixed top-6 left-6 z-50 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to home</span>
      </button>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Pulse
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {currentStep === "email" && "Welcome to Pulse"}
              {currentStep === "otp" && "Verify your email"}
              {currentStep === "success" && "Welcome aboard!"}
            </h1>
            <p className="text-gray-400">
              {currentStep === "email" &&
                "Start chatting in seconds with OTP verification"}
              {currentStep === "otp" &&
                `We sent a verification code to ${email}`}
              {currentStep === "success" &&
                "Your account has been created successfully"}
            </p>
          </div>

          {currentStep === "email" && (
            <EmailStep onSubmit={handleEmailSubmit} isLoading={isLoading} />
          )}

          {currentStep === "otp" && (
            <OTPStep
              email={email}
              onVerify={handleOTPVerify}
              onBack={handleBackToEmail}
              isLoading={isLoading}
            />
          )}

          {currentStep === "success" && (
            <SuccessStep onContinue={() => console.log("Continue to chat")} />
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="flex-1 flex items-center justify-center p-8">
        <SignupIllustration currentStep={currentStep} />
      </div>
    </div>
  );
};

export default SignupPage;
