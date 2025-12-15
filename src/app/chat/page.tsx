"use client";
import ChatSidebar from "@/components/ChatSidebar";
import Loading from "@/components/Loading";
import { chat_service, useAppData, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import MessageInput from "@/components/MessageInput";
import { SocketData } from "@/context/SocketContext";
import { isCoupleChat } from "@/config/coupleTheme";

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

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
  repliedMessage?: {
    _id: string;
    text?: string;
    sender: string;
    messageType: "text" | "image" | "deleted";
    image?: {
      url: string;
      publicId: string;
    };
  };
  isEdited?: boolean;
  editedAt?: Date;
  linkPreview?: LinkPreview;
}

// Type for sidebar message display
interface SidebarMessage {
  text: string;
  sender: string;
  messageType?: "text" | "image" | "deleted" | "reply" | "forward";
}

// Type for reaction
interface Reaction {
  userId: string;
  emoji: string;
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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [forceScrollToBottom, setForceScrollToBottom] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<
    Message[] | undefined
  >(undefined);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);

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

  // Fetch initial messages (page 1 - most recent 50 messages)
  const fetchChat = useCallback(async () => {
    if (!selectedUser) return;

    setIsLoadingChat(true);
    setCurrentPage(1); // Reset to page 1 for new chat
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}?page=1&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📦 Fetched chat data:", {
        userName: data.user?.name,
        userId: data.user?._id,
        lastSeen: data.user?.lastSeen,
        privacySettings: data.user?.privacySettings,
      });

      setMessages(data.messages);
      setUser(data.user);
      setHasMoreMessages(data.pagination?.hasMore || false);
      setTotalMessages(data.pagination?.totalMessages || 0);
      await fetchChats();

      setIsLoadingChat(false);

      // Force scroll to bottom after messages are loaded
      setTimeout(() => {
        setForceScrollToBottom(true);
        setTimeout(() => setForceScrollToBottom(false), 200);
      }, 100);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");
      setIsLoadingChat(false);
    }
  }, [selectedUser, fetchChats]);

  // Load older messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!selectedUser || !hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    const token = Cookies.get("token");

    try {
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selectedUser}?page=${nextPage}&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Prepend older messages to the beginning
      setMessages((prev) => [...(data.messages || []), ...(prev || [])]);
      setCurrentPage(nextPage);
      setHasMoreMessages(data.pagination?.hasMore || false);
      setIsLoadingMore(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load older messages");
      setIsLoadingMore(false);
    }
  }, [selectedUser, hasMoreMessages, isLoadingMore, currentPage]);

  const moveChatToTop = useCallback(
    (chatId: string, newMessage: SidebarMessage, updatedUnseenCount = true) => {
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
    },
    [setChats, loggedInUser?._id]
  );

  const resetUnseenCount = useCallback(
    (chatId: string) => {
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
    },
    [setChats]
  );

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
      console.error(error);
      toast.error("Failed to start chat");
    }
  }

  const handleMessageSend = async (
    e: React.FormEvent,
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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Something went wrong");
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
          sender: loggedInUser?._id || "",
        },
        false
      );

      console.log("📤 Message deleted successfully:", messageId);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete message");
    }
  };

  // ✅ Handle replying to a message
  const handleReplyToMessage = (message: Message) => {
    setReplyingToMessage(message);
  };

  // ✅ Handle forwarding a message
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleForwardMessage = (_message: Message) => {
    // TODO: Implement modal or UI for selecting who to forward to
    toast.success("Forward feature coming soon!");
  };

  // ✅ Handle editing a message - opens edit mode
  const handleEditMessage = (messageToEdit: Message) => {
    // Check if message is within 15 minutes
    const messageCreatedAt = new Date(messageToEdit.createdAt).getTime();
    const currentTime = Date.now();
    const fifteenMinutesInMs = 15 * 60 * 1000;

    if (currentTime - messageCreatedAt > fifteenMinutesInMs) {
      toast.error("Messages can only be edited within 15 minutes of sending");
      return;
    }

    setEditingMessage(messageToEdit);
    setMessage(messageToEdit.text || "");
    setReplyingToMessage(null); // Clear any reply state
  };

  // ✅ Handle submitting edited message
  const handleEditSubmit = async (e: React.FormEvent, editedText: string) => {
    e.preventDefault();

    if (!editingMessage || !editedText.trim()) return;
    if (!selectedUser) return;

    const token = Cookies.get("token");

    try {
      await axios.put(
        `${chat_service}/api/v1/messages/${editingMessage._id}`,
        { text: editedText.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update message locally for immediate feedback
      setMessages((prev) => {
        if (!prev) return null;
        return prev.map((msg) => {
          if (msg._id === editingMessage._id) {
            return {
              ...msg,
              text: editedText.trim(),
              isEdited: true,
              editedAt: new Date(),
            };
          }
          return msg;
        });
      });

      // Update chat sidebar if this was the latest message
      moveChatToTop(
        selectedUser,
        {
          text: editedText.trim(),
          sender: loggedInUser?._id || "",
          messageType: editingMessage.messageType,
        },
        false
      );

      setEditingMessage(null);
      setMessage("");

      console.log("📝 Message edited successfully:", editingMessage._id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to edit message");
    }
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
    } catch (error: unknown) {
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
      (data: { messageId: string; reactions: Reaction[] }) => {
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

    // ✅ Listen for edited messages
    socket?.on("messageEdited", (editedMessage) => {
      console.log("📝 Received messageEdited event:", editedMessage);
      if (selectedUser === editedMessage.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) =>
            msg._id === editedMessage._id
              ? {
                  ...msg,
                  text: editedMessage.text,
                  isEdited: true,
                  editedAt: editedMessage.editedAt,
                }
              : msg
          );
        });
      }
    });

    // ✅ Listen for message updates (link previews)
    socket?.on("messageUpdated", (updatedMessage) => {
      console.log("🔗 Received messageUpdated event:", updatedMessage);
      if (selectedUser === updatedMessage.chatId) {
        setMessages((prev) => {
          if (!prev) return null;
          return prev.map((msg) =>
            msg._id === updatedMessage._id
              ? {
                  ...msg,
                  linkPreview: updatedMessage.linkPreview,
                }
              : msg
          );
        });
      }
    });

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
      socket?.off("messageEdited");
      socket?.off("messageUpdated");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    };
  }, [socket, selectedUser, setChats, loggedInUser?._id, moveChatToTop]);

  useEffect(() => {
    if (selectedUser) {
      // Immediately clear messages to prevent flash
      setMessages(null);
      setReplyingToMessage(null);
      setEditingMessage(null); // Clear editing state when switching chats
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
  }, [selectedUser, socket, fetchChat, resetUnseenCount]);

  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut);
      }
    };
  }, [typingTimeOut]);

  // 💕 Check if this is the special couple's chat
  const isPinkTheme = useMemo(() => {
    return isCoupleChat(loggedInUser?.email, user?.email);
  }, [loggedInUser?.email, user?.email]);

  if (loading) return <Loading />;

  return (
    /* --- UPDATED CLASS HERE: Changed h-screen to h-[100dvh] --- */
    <div
      className={`flex h-[100dvh] w-full bg-gray-900 text-white relative overflow-hidden pink-theme-transition ${
        isPinkTheme ? "pink-theme" : ""
      }`}
    >
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

        <div className="flex-1 px-2 sm:px-4 overflow-hidden flex flex-col">
          <ChatMessages
            selectedUser={selectedUser}
            messages={messages}
            loggedInUser={loggedInUser}
            onDeleteMessage={handleDeleteMessage}
            onReplyToMessage={handleReplyToMessage}
            onForwardMessage={handleForwardMessage}
            onAddReaction={handleAddReaction}
            onEditMessage={handleEditMessage}
            forceScrollToBottom={forceScrollToBottom}
            isLoadingChat={isLoadingChat}
            searchQuery={searchQuery}
            filteredMessages={filteredMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreMessages}
            totalMessages={totalMessages}
          />
        </div>

        <div className="px-2 sm:px-4 pb-safe-area-inset-bottom pt-1 bg-gray-900">
          <MessageInput
            selectedUser={selectedUser}
            message={message}
            setMessage={handleTyping}
            handleMessageSend={handleMessageSend}
            handleEditSubmit={handleEditSubmit}
            replyingToMessage={replyingToMessage}
            setReplyingToMessage={setReplyingToMessage}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
