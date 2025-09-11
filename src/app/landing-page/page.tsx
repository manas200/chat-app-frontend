"use client";

import { useRouter } from "next/navigation";
import LandingPage from "@/components/lander/LandingPage";

export default function Home() {
  const router = useRouter();

  const handleSignupClick = () => {
    router.push("/login");
  };

  return <LandingPage onSignupClick={handleSignupClick} />;
}
