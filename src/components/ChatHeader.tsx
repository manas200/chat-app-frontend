import { User } from "@/context/AppContext";
import { UserCircle, PanelLeftClose, Search, X } from "lucide-react";
import React, { useState, useMemo } from "react";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
  onSearch?: (query: string) => void;
  onSearchClose?: () => void;
  searchQuery?: string;
}

// Helper function to format last seen time
const formatLastSeen = (lastSeenDate: string | Date | undefined): string => {
  if (!lastSeenDate) return "Offline";

  const lastSeen = new Date(lastSeenDate);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Last seen just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Last seen ${diffInMinutes} ${
      diffInMinutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Last seen ${diffInHours} ${
      diffInHours === 1 ? "hour" : "hours"
    } ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Last seen ${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  // For dates older than a week, show the actual date
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return `Last seen ${lastSeen.toLocaleDateString(undefined, options)}`;
};

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
  onSearch,
  onSearchClose,
  searchQuery = "",
}: ChatHeaderProps) => {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const isOnlineUser = user && onlineUsers.includes(user._id);

  // Get formatted last seen text
  const lastSeenText = useMemo(() => {
    if (!user || isOnlineUser) return null;

    // The API already handles privacy - it won't return lastSeen if user disabled it
    // If lastSeen is null/undefined, show "Offline"
    if (!user.lastSeen) return "Offline";

    return formatLastSeen(user.lastSeen);
  }, [user, isOnlineUser]);

  const handleSearchToggle = () => {
    if (isSearchMode) {
      // Close search mode
      setIsSearchMode(false);
      setLocalSearchQuery("");
      onSearchClose?.();
    } else {
      // Open search mode
      setIsSearchMode(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <>
      {!isSearchMode && (
        <div className="sm:hidden fixed top-2.5 right-4 z-30">
          <button
            className="p-1.5 m-1.5  text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeftClose className="w-5.5 h-5.5" />
          </button>
        </div>
      )}

      {/* Chat header */}
      <div className="mb-2 sm:mb-4 bg-gray-800 border border-gray-700 p-2 px-3 relative">
        {isSearchMode ? (
          /* Search Mode */
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSearchToggle}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search messages..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
                autoFocus
              />
            </div>
            {localSearchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Normal Mode */
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <>
                <div className="relative">
                  <div
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-700 flex items-center justify-center
                  "
                  >
                    <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                  </div>
                  {/* online user setup */}
                  {isOnlineUser && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 border-2 border-gray-800">
                      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
                    </span>
                  )}
                </div>

                {/* user info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 ">
                    <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                      {user.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTyping ? (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-blue-500 font-medium">
                          typing...
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isOnlineUser ? "bg-green-500" : "bg-gray-500"
                          }`}
                        ></div>
                        <span
                          className={`text-sm font-medium ${
                            isOnlineUser ? "text-green-500" : "text-gray-400"
                          }`}
                        >
                          {isOnlineUser ? "Online" : lastSeenText || "Offline"}{" "}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pr-12 sm:p-0">
                  <button
                    onClick={handleSearchToggle}
                    className="p-1.5 m-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
                    title="Search messages"
                  >
                    <Search className="w-5.5 h-5.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-400">
                    Select a conversation
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Choose a chat from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ChatHeader;
