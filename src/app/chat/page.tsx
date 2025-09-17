"use client";
import ChatSidebar from "@/components/ChatSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import { SocketData } from "@/context/SocketContext";

// In your chat page, update the Message interface
export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image" | "deleted" | "reply" | "forward";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  reactions?: {
    userId: string;
    emoji: string;
  }[];
  replyTo?: string;
  forwardedFrom?: string;
  // Fix the type for repliedMessage
  repliedMessage?: {
    _id: string;
    text?: string;
    sender: string;
    messageType: "text" | "image" | "deleted"; // Only these three types
    image?: {
      url: string;
      publicId: string;
    };
  };
}

const ChatApp = () => {
  const {
    loading,
    isAuth,
    logoutUser,
    chats,
    user: loggedInUser,
    users,
    fetchChats,
    setChats,
  } = useAppData();

  const { onlineUsers, socket } = SocketData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [siderbarOpen, setSiderbarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAllUser, setShowAllUser] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(
    null
  );
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(
    null
  );
  const [forceScrollToBottom, setForceScrollToBottom] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<
    Message[] | undefined
  >(undefined);

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  const handleLogout = () => logoutUser();

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredMessages(undefined);
      return;
    }

    if (!messages) {
      setFilteredMessages([]);
      return;
    }

    const filtered = messages.filter((message) => {
      // Don't search deleted messages
      if (message.messageType === "deleted") return false;

      // Search in message text
      if (
        message.text &&
        message.text.toLowerCase().includes(query.toLowerCase())
      ) {
        return true;
      }

      // Search in replied message text if it exists
      if (
        message.repliedMessage?.text &&
        message.repliedMessage.text.toLowerCase().includes(query.toLowerCase())
      ) {
        return true;
      }

      return false;
    });

    setFilteredMessages(filtered);
  };

  const handleSearchClose = () => {
    setSearchQuery("");
    setFilteredMessages(undefined);
  };

  async function fetchChat() {
    if (!selectedUser) return;

    setIsLoadingChat(true); // Show loading state immediately
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages(data.messages);
      setUser(data.user);
      await fetchChats();

      setIsLoadingChat(false); // Hide loading state

      // Force scroll to bottom after messages are loaded
      setTimeout(() => {
        setForceScrollToBottom(true);
        // Reset the force scroll flag after a brief delay
        setTimeout(() => setForceScrollToBottom(false), 200);
      }, 100);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
      setIsLoadingChat(false); // Hide loading state on error too
    }
  }

  const moveChatToTop = (
    chatId: string,
    newMessage: any,
    updatedUnseenCount = true
  ) => {
    setChats((prev) => {
      if (!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex(
        (chat) => chat.chat._id === chatId
      );

      if (chatIndex !== -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: {
              text:
                newMessage.messageType === "deleted"
                  ? "Message deleted"
                  : newMessage.messageType === "reply"
                  ? `↩️ ${newMessage.text}`
                  : newMessage.messageType === "image"
                  ? "📷 Image"
                  : newMessage.text,
              sender: newMessage.sender,
            },
            updatedAt: new Date().toString(),
            unseenCount:
              updatedUnseenCount && newMessage.sender !== loggedInUser?._id
                ? (moveChat.chat.unseenCount || 0) + 1
                : moveChat.chat.unseenCount || 0,
          },
        };

        updatedChats.unshift(updatedChat);
      }

      return updatedChats;
    });
  };

  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {
            ...chat,
            chat: {
              ...chat.chat,
              unseenCount: 0,
            },
          };
        }
        return chat;
      });
    });
  };

  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/new`,
        {
          userId: loggedInUser?._id,
          otherUserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedUser(data.chatId);
      setShowAllUser(false);
      await fetchChats();
    } catch (error) {
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async (
    e: any,
    imageFile?: File | null,
    replyTo?: string
  ) => {
    e.preventDefault();

    if (!message.trim() && !imageFile) return;
    if (!selectedUser) return;

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

    const token = Cookies.get("token");

    try {
      const formData = new FormData();
      formData.append("chatId", selectedUser);

      if (message.trim()) {
        formData.append("text", message);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (replyTo) {
        console.log("Adding replyTo to formData:", replyTo);
        formData.append("replyTo", replyTo);
      }

      const { data } = await axios.post(
        `${chat_service}/api/v1/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Ensure we have the repliedMessage data for immediate UI update
      let messageWithReply = data.message;
      if (replyTo && !messageWithReply.repliedMessage) {
        // If backend didn't populate repliedMessage, find the replied message locally
        const repliedMessage = messages?.find((msg) => msg._id === replyTo);
        if (repliedMessage) {
          messageWithReply = {
            ...messageWithReply,
            repliedMessage: {
              _id: repliedMessage._id,
              text: repliedMessage.text || "",
              sender: repliedMessage.sender,
              messageType:
                repliedMessage.messageType === "image"
                  ? "image"
                  : repliedMessage.messageType === "deleted"
                  ? "deleted"
                  : "text",
              image: repliedMessage.image,
            },
          };
        }
      }

      setMessages((prev) => {
        const currentMessages = prev || [];
        const messageExists = currentMessages.some(
          (msg) => msg._id === messageWithReply._id
        );
        if (!messageExists) {
          return [...currentMessages, messageWithReply];
        }
        return currentMessages;
      });

      setMessage("");
      setReplyingToMessage(null);

      // Force scroll to bottom after sending message
      setForceScrollToBottom(true);
      // Reset the force scroll flag after a brief delay
      setTimeout(() => setForceScrollToBottom(false), 100);

      const displayText = imageFile ? "📷 image" : message;
      moveChatToTop(
        selectedUser!,
        {
          text: displayText,
          sender: data.sender,
          messageType: data.message.messageType,
        },
        false
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (!selectedUser || !socket) return;

    if ((value ?? "").trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }, 2000);

    setTypingTimeOut(timeout);
  };

  // ✅ Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedUser || !socket) return;

    const token = Cookies.get("token");
    try {
      await axios.delete(`${chat_service}/api/v1/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the message to show 'deleted' state locally for immediate feedback
      setMessages((prev) => {
        if (!prev) return null;
        return prev.map((msg) => {
          if (msg._id === messageId) {
            return {
              ...msg,
              messageType: "deleted" as const,
              text: "",
              image: undefined,
              reactions: [], // Clear reactions when message is deleted
            };
          }
          return msg;
        });
      });

      // Update chat sidebar to show "Message deleted"
      moveChatToTop(
        selectedUser,
        {
          messageType: "deleted",
          text: "",
          sender: loggedInUser?._id,
        },
        false
      );

      console.log("📤 Message deleted successfully:", messageId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  };

  // ✅ Handle replying to a message
  const handleReplyToMessage = (message: Message) => {
    setReplyingToMessage(message);
  };

  // ✅ Handle forwarding a message
  const handleForwardMessage = (message: Message) => {
    // You can implement a modal or UI for selecting who to forward to
    toast.success("Forward feature coming soon!");
  };

  // ✅ Handle adding reaction to a message
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!socket || !loggedInUser?._id || !selectedUser) {
      console.error("Missing required data for reaction:", {
        socket: !!socket,
        userId: loggedInUser?._id,
        selectedUser,
      });
      return;
    }

    console.log("Adding reaction:", {
      messageId,
      emoji,
      userId: loggedInUser._id,
    });
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);

    try {
      // Emit socket event for real-time reaction (socket handler will save to DB)
      socket.emit("addReaction", {
        messageId,
        emoji,
        userId: loggedInUser._id,
      });

      console.log("Reaction emitted via socket");
    } catch (error: any) {
      console.error("Error emitting reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || [];
          const messageExists = currentMessages.some(
            (msg) => msg._id === message._id
          );

          if (!messageExists) {
            // Ensure repliedMessage has proper structure if it's a reply
            let formattedMessage = message;
            if (message.messageType === "reply" && message.repliedMessage) {
              const repliedMsg = message.repliedMessage;
              formattedMessage = {
                ...message,
                repliedMessage: {
                  _id: repliedMsg._id,
                  text: repliedMsg.text || "",
                  sender: repliedMsg.sender?.toString() || "",
                  messageType:
                    repliedMsg.messageType === "image"
                      ? "image"
                      : repliedMsg.messageType === "deleted"
                      ? "deleted"
                      : "text",
                  image: repliedMsg.image || undefined,
                },
              };
            }
            return [...currentMessages, formattedMessage];
          }
          return currentMessages;
        });
        moveChatToTop(message.chatId, message, false);
      } else {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messagesSeen", (data) => {
      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) => {
            if (
              msg.sender === loggedInUser?._id &&
              data.messageIds?.includes(msg._id)
            ) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date(),
              };
            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return {
                ...msg,
                seen: true,
                seenAt: new Date(),
              };
            }
            return msg;
          });
        });
      }
    });

    // ✅ Listen for deleted messages
    socket?.on("messageDeleted", (deletedMessage) => {
      console.log("📤 Received messageDeleted event:", deletedMessage);
      if (selectedUser === deletedMessage.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          const updatedMessages = prev.map((msg) =>
            msg._id === deletedMessage._id
              ? {
                  ...deletedMessage,
                  messageType: "deleted",
                  text: "",
                  image: undefined,
                  reactions: [], // Ensure reactions are cleared
                }
              : msg
          );
          console.log(
            "✅ Message updated to deleted state:",
            deletedMessage._id
          );
          return updatedMessages;
        });
      }
    });

    // ✅ Listen for reaction updates
    socket?.on(
      "messageReaction",
      (data: { messageId: string; reactions: any[] }) => {
        console.log("Received reaction update:", data);
        if (selectedUser) {
          setMessages((prev) => {
            if (!prev) return null;
            const updatedMessages = prev.map((msg) =>
              msg._id === data.messageId
                ? { ...msg, reactions: data.reactions }
                : msg
            );
            console.log(
              "Updated messages with reactions:",
              updatedMessages.find((m) => m._id === data.messageId)?.reactions
            );
            return updatedMessages;
          });
        }
      }
    );

    socket?.on("userTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(true);
      }
    });

    socket?.on("userStoppedTyping", (data) => {
      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messagesSeen");
      socket?.off("messageDeleted");
      socket?.off("messageReaction");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    };
  }, [socket, selectedUser, setChats, loggedInUser?._id]);

  useEffect(() => {
    if (selectedUser) {
      // Immediately clear messages to prevent flash
      setMessages(null);
      setReplyingToMessage(null);
      setIsLoadingChat(true);

      // Clear search when switching users
      setSearchQuery("");
      setFilteredMessages(undefined);

      fetchChat();
      setIsTyping(false);
      resetUnseenCount(selectedUser);
      console.log("Joining chat room:", selectedUser);
      socket?.emit("joinChat", selectedUser);

      return () => {
        socket?.emit("leaveChat", selectedUser);
        setMessages(null);
        setReplyingToMessage(null);
        setSearchQuery("");
        setFilteredMessages(undefined);
      };
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut);
      }
    };
  }, [typingTimeOut]);

  if (loading) return <Loading />;

  return (
    <div className="mobile-viewport h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ChatSidebar
        sidebarOpen={siderbarOpen}
        setSidebarOpen={setSiderbarOpen}
        showAllUsers={showAllUser}
        setShowAllUsers={setShowAllUser}
        users={users}
        loggedInUser={loggedInUser}
        chats={chats}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleLogout={handleLogout}
        createChat={createChat}
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-xl border-white/10 shadow-2xl">
        <ChatHeader
          user={user}
          setSidebarOpen={setSiderbarOpen}
          isTyping={isTyping}
          onlineUsers={onlineUsers}
          onSearch={handleSearch}
          onSearchClose={handleSearchClose}
          searchQuery={searchQuery}
        />

        <div className="flex-1 px-2 sm:px-4 overflow-hidden">
          <ChatMessages
            selectedUser={selectedUser}
            messages={messages}
            loggedInUser={loggedInUser}
            onDeleteMessage={handleDeleteMessage}
            onReplyToMessage={handleReplyToMessage}
            onForwardMessage={handleForwardMessage}
            onAddReaction={handleAddReaction}
            forceScrollToBottom={forceScrollToBottom}
            isLoadingChat={isLoadingChat}
            searchQuery={searchQuery}
            filteredMessages={filteredMessages}
          />
        </div>

        <div className="px-2 sm:px-4 pb-safe-area-inset-bottom pt-1 bg-gray-900">
          <MessageInput
            selectedUser={selectedUser}
            message={message}
            setMessage={handleTyping}
            handleMessageSend={handleMessageSend}
            replyingToMessage={replyingToMessage}
            setReplyingToMessage={setReplyingToMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
