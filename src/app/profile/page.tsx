"use client";

import {
  PrivacySettings,
  useAppData,
  user_service,
} from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import PrivacySettingsSection from "@/components/PrivacySettingsSection";
import { ArrowLeft, Save, User, Mail, Calendar, X, Pencil } from "lucide-react";

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState<string | undefined>("");
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showOnlineStatus: true,
    showReadReceipts: true,
    showLastSeen: true,
  });
  const [loadingPrivacy, setLoadingPrivacy] = useState(true);

  const router = useRouter();

  // Fetch privacy settings on mount
  useEffect(() => {
    const fetchPrivacySettings = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const { data } = await axios.get(
          `${user_service}/api/v1/privacy-settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPrivacySettings(data.privacySettings);
      } catch (error) {
        console.error("Error fetching privacy settings:", error);
      } finally {
        setLoadingPrivacy(false);
      }
    };

    if (isAuth) {
      fetchPrivacySettings();
    }
  }, [isAuth]);

  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = Cookies.get("token");
    try {
      const { data } = await axios.post(
        `${user_service}/api/v1/update/user`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      toast.success(data.message);
      setUser(data.user);
      setIsEdit(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update name";
      toast.error(errorMessage);
    }
  };

  const handlePrivacyUpdate = (newSettings: PrivacySettings) => {
    setPrivacySettings(newSettings);
  };

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  if (loading) return <Loading />;

  // Format join date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="h-screen overflow-y-auto chat-scroll show bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/chat")}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Profile
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Manage your account
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-16 space-y-6">
        {/* Profile Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          {/* Profile Header with Gradient */}
          <div className="relative h-24 sm:h-32 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-gray-800 flex items-center justify-center shadow-xl overflow-hidden">
                  <span className="text-5xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-lg border-2 border-gray-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Name and Email */}
            <div className="pt-16">
              {isEdit ? (
                <form onSubmit={submitHandler} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={editHandler}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-all duration-200"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-white mb-1 truncate">
                      {user?.name || "User"}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{user?.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={editHandler}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-xl border border-gray-600 transition-all duration-200"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/30">
            <div className="flex items-center gap-3 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Member since{" "}
                {formatDate(
                  (user as unknown as { createdAt?: string })?.createdAt
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        {!loadingPrivacy && (
          <PrivacySettingsSection
            privacySettings={privacySettings}
            onUpdate={handlePrivacyUpdate}
          />
        )}

        {loadingPrivacy && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            <div className="flex items-center justify-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading privacy settings...</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Active
            </div>
            <div className="text-sm text-gray-400">Account Status</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-5">
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
              ✓
            </div>
            <div className="text-sm text-gray-400">Email Verified</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
