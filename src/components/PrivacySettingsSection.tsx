"use client";

import { PrivacySettings, user_service } from "@/context/AppContext";
import { SocketData } from "@/context/SocketContext";
import axios from "axios";
import Cookies from "js-cookie";
import { Eye, EyeOff, CheckCheck, Clock, Shield, Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface PrivacySettingsSectionProps {
  privacySettings: PrivacySettings;
  onUpdate: (settings: PrivacySettings) => void;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  loading?: boolean;
}

const ToggleSwitch = ({ enabled, onChange, loading }: ToggleSwitchProps) => (
  <button
    onClick={onChange}
    disabled={loading}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
      enabled ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-gray-600"
    } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    >
      {loading && (
        <Loader2 className="w-3 h-3 animate-spin text-gray-400 absolute top-1 left-1" />
      )}
    </span>
  </button>
);

const PrivacySettingsSection = ({
  privacySettings,
  onUpdate,
}: PrivacySettingsSectionProps) => {
  const { socket } = SocketData();
  const [loading, setLoading] = useState<string | null>(null);
  const [settings, setSettings] = useState<PrivacySettings>(privacySettings);

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    setLoading(key);
    const token = Cookies.get("token");

    try {
      const { data } = await axios.put(
        `${user_service}/api/v1/privacy-settings`,
        { [key]: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      onUpdate(newSettings);

      // Update token if provided
      if (data.token) {
        Cookies.set("token", data.token, {
          expires: 15,
          secure: false,
          path: "/",
        });
      }

      // Notify socket about privacy settings change
      if (key === "showOnlineStatus" && socket) {
        socket.emit("updatePrivacySettings", { showOnlineStatus: value });
      }

      toast.success(
        value
          ? `${getSettingLabel(key)} is now visible`
          : `${getSettingLabel(key)} is now hidden`
      );
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setLoading(null);
    }
  };

  const getSettingLabel = (key: keyof PrivacySettings): string => {
    switch (key) {
      case "showOnlineStatus":
        return "Online status";
      case "showReadReceipts":
        return "Read receipts";
      case "showLastSeen":
        return "Last seen";
      default:
        return key;
    }
  };

  const settingsConfig = [
    {
      key: "showOnlineStatus" as const,
      title: "Online Status",
      description: "Show when you're online to other users",
      icon: settings.showOnlineStatus ? Eye : EyeOff,
      iconColor: settings.showOnlineStatus ? "text-green-400" : "text-gray-400",
      enabled: settings.showOnlineStatus,
    },
    {
      key: "showReadReceipts" as const,
      title: "Read Receipts",
      description: "Show blue ticks when you've read messages",
      icon: CheckCheck,
      iconColor: settings.showReadReceipts ? "text-blue-400" : "text-gray-400",
      enabled: settings.showReadReceipts,
    },
    {
      key: "showLastSeen" as const,
      title: "Last Seen",
      description: "Show when you were last active",
      icon: Clock,
      iconColor: settings.showLastSeen ? "text-purple-400" : "text-gray-400",
      enabled: settings.showLastSeen,
    },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 rounded-t-2xl border border-gray-500/50  bg-gray-700/50 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-400/10 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Privacy Settings
            </h3>
            <p className="text-sm text-gray-400">
              Control who can see your activity
            </p>
          </div>
        </div>
      </div>

      {/* Settings List */}
      <div className="divide-y divide-gray-700/50">
        {settingsConfig.map((setting, index) => {
          const Icon = setting.icon;
          const isLoading = loading === setting.key;

          return (
            <div
              key={setting.key}
              className={`px-6 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-gray-700/20 ${
                index === 0 ? "" : ""
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${
                    setting.enabled ? "bg-gray-700/50" : "bg-gray-800/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${setting.iconColor}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium">{setting.title}</h4>
                  <p className="text-sm text-gray-400 truncate">
                    {setting.description}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                enabled={setting.enabled}
                onChange={() => updateSetting(setting.key, !setting.enabled)}
                loading={isLoading}
              />
            </div>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" />
          Your privacy settings apply to all users
        </p>
      </div>
    </div>
  );
};

export default PrivacySettingsSection;
