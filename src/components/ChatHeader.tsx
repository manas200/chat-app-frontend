import { User } from "@/context/AppContext";
import { Menu, UserCircle, PanelLeftClose } from "lucide-react";
import React from "react";

interface ChatHeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  isTyping: boolean;
  onlineUsers: string[];
}

const ChatHeader = ({
  user,
  setSidebarOpen,
  isTyping,
  onlineUsers,
}: ChatHeaderProps) => {
  const isOnlineUser = user && onlineUsers.includes(user._id);
  return (
    <>
      {/* {side panel} */}
      <div className="sm:hidden fixed top-2.5 right-4 z-30">
        <button
          className="p-1.5 m-1.5 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <PanelLeftClose className="w-5.5 h-5.5 text-gray-200" />
        </button>
      </div>

      {/* chat header */}
      <div className="mb-2 sm:mb-4 bg-gray-800 border border-gray-700 p-2 px-3">
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
                        {isOnlineUser ? "Online" : "Offline"}{" "}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
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
      </div>
    </>
  );
};

export default ChatHeader;
