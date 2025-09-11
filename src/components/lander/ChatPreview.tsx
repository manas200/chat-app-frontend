"use client";
import React, { useState, useEffect } from "react";
import { Send, Phone, Video, MoreVertical } from "lucide-react";

const ChatPreview: React.FC = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How's the new project going?",
      sender: "other",
      time: "2:30 PM",
      avatar: "👨‍💻",
    },
    {
      id: 2,
      text: "Great! Just finished the design mockups",
      sender: "me",
      time: "2:32 PM",
      avatar: "👨‍💻",
    },
    {
      id: 3,
      text: "Can you share them with the team?",
      sender: "other",
      time: "2:33 PM",
      avatar: "👨‍💻",
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: "Already sent! Check the shared folder 📁",
            sender: "me",
            time: "2:35 PM",
            avatar: "👨‍💻",
          },
        ]);
        setIsTyping(false);
      }, 2000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative max-w-md mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl"></div>

      <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-lg">
              👨‍💻
            </div>
            <div>
              <div className="font-semibold text-white">Manas Chaturvedi</div>
              <div className="text-xs text-green-400">Online</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Phone className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Video className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
              } animate-fade-in-up`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl ${
                  message.sender === "me"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white ml-8"
                    : "bg-white/10 text-gray-100 mr-8 backdrop-blur-sm"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "me" ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 mr-8">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:outline-none transition-colors"
            />
            <button className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-full transition-all duration-200 transform hover:scale-105">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPreview;
