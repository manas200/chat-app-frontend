import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import { SocketData } from "@/context/SocketContext";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import moment from "moment";
import {
  Check,
  CheckCheck,
  Zap,
  Trash,
  Reply,
  Forward,
  Smile,
  ImageIcon,
} from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  onDeleteMessage?: (messageId: string) => void;
  onReplyToMessage?: (message: Message) => void;
  onForwardMessage?: (message: Message) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  forceScrollToBottom?: boolean;
  isLoadingChat?: boolean;
  searchQuery?: string;
  filteredMessages?: Message[];
}

const ChatMessages = React.memo(
  ({
    selectedUser,
    messages,
    loggedInUser,
    onDeleteMessage,
    onReplyToMessage,
    onForwardMessage,
    onAddReaction,
    forceScrollToBottom,
    isLoadingChat,
    searchQuery = "",
    filteredMessages,
  }: ChatMessagesProps) => {
    const { socket } = SocketData();
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollbar, setShowScrollbar] = useState(false);
    const [localMessages, setLocalMessages] = useState<Message[]>(
      messages || []
    );
    const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
      null
    );
    const [tappedMessage, setTappedMessage] = useState<string | null>(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;

        if (
          showReactionPicker &&
          !target.closest(".reaction-picker") &&
          !target.closest(".reaction-button")
        ) {
          setShowReactionPicker(null);
        }

        if (
          tappedMessage &&
          !target.closest(".message-bubble") &&
          !target.closest(".message-actions")
        ) {
          setTappedMessage(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [showReactionPicker, tappedMessage]);

    useEffect(() => {
      if (messages && messages.length > 0 && selectedUser) {
        setLocalMessages(messages);

        const scrollToEnd = () => {
          if (scrollRef.current) {
            const container = scrollRef.current;
            container.scrollTop = container.scrollHeight;
          }
        };

        const scrollAttempts = [0, 10, 50, 100, 200, 300];
        scrollAttempts.forEach((delay) => {
          setTimeout(scrollToEnd, delay);
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(scrollToEnd);
        });
      } else {
        setLocalMessages([]);
      }
    }, [messages, selectedUser]);

    useEffect(() => {
      if (!socket) return;

      const handleMessageDeleted = ({
        messageId,
        chatId,
      }: {
        messageId: string;
        chatId: string;
      }) => {
        if (chatId !== selectedUser) return;
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  text: "",
                  image: undefined,
                  messageType: "deleted",
                }
              : msg
          )
        );
      };

      const handleMessageReaction = ({
        messageId,
        reactions,
      }: {
        messageId: string;
        reactions: { userId: string; emoji: string }[];
      }) => {
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, reactions } : msg
          )
        );
      };

      socket.on("messageDeleted", handleMessageDeleted);
      socket.on("messageReaction", handleMessageReaction);

      return () => {
        socket.off("messageDeleted", handleMessageDeleted);
        socket.off("messageReaction", handleMessageReaction);
      };
    }, [socket, selectedUser]);

    const handleAddReaction = (messageId: string, emoji: string) => {
      if (onAddReaction) {
        onAddReaction(messageId, emoji);
      }
      setShowReactionPicker(null);
    };

    // Helper function to highlight search terms
    const highlightSearchTerm = (text: string, searchTerm: string) => {
      if (!searchTerm || !text) return text;

      const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      const parts = text.split(regex);

      return parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <span
              key={index}
              className="bg-yellow-500/30 text-yellow-200 px-1 rounded"
            >
              {part}
            </span>
          );
        }
        return part;
      });
    };

    const uniqueMessages = useMemo(() => {
      const messagesToProcess =
        searchQuery && filteredMessages ? filteredMessages : localMessages;

      const seen = new Set();
      return messagesToProcess.filter((msg) => {
        if (seen.has(msg._id)) return false;
        seen.add(msg._id);
        return true;
      });
    }, [localMessages, searchQuery, filteredMessages]);

    const scrollToBottom = useCallback(
      (smooth: boolean, force: boolean = false) => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;

        if (force) {
          // INSTANT scroll to bottom for chat switching - no animation
          container.scrollTop = container.scrollHeight;

          // Additional attempts to ensure it works
          setTimeout(() => {
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 50);

          setTimeout(() => {
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          }, 100);
        } else {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

          if (isNearBottom) {
            if (bottomRef.current) {
              bottomRef.current.scrollIntoView({
                behavior: smooth ? "smooth" : "auto",
                block: "end",
              });
            } else {
              // Fallback if bottomRef is not available
              container.scrollTop = container.scrollHeight;
            }
          }
        }
      },
      []
    );

    useEffect(() => {
      if (selectedUser) {
        scrollToBottom(false, true);
      }
    }, [selectedUser, scrollToBottom]);

    useEffect(() => {
      if (uniqueMessages.length > 0) {
        scrollToBottom(true, false);
      }
    }, [uniqueMessages, scrollToBottom]);

    useEffect(() => {
      if (forceScrollToBottom) {
        scrollToBottom(false, true);
      }
    }, [forceScrollToBottom, scrollToBottom]);

    useEffect(() => {
      if (!isLoadingChat && messages && messages.length > 0 && selectedUser) {
        setTimeout(() => {
          if (scrollRef.current) {
            const container = scrollRef.current;
            container.scrollTop = container.scrollHeight;

            setTimeout(() => {
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            }, 100);
          }
        }, 50);
      }
    }, [isLoadingChat, messages, selectedUser]);

    useLayoutEffect(() => {
      if (uniqueMessages.length > 0 && selectedUser && !isLoadingChat) {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }
    }, [uniqueMessages.length, selectedUser, isLoadingChat]);

    useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;
      let timeout: NodeJS.Timeout;
      const handleScroll = () => {
        setShowScrollbar(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setShowScrollbar(false), 1000);
      };
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        clearTimeout(timeout);
      };
    }, []);

    const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

    return (
      <div className="flex-1 overflow-hidden ">
        <div
          ref={scrollRef}
          className={`h-full max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 chat-scroll flex flex-col ${
            showScrollbar ? "show" : ""
          }`}
          style={{
            scrollbarGutter: "stable",
            willChange: "transform",
          }}
        >
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-2 px-4">
              <div className="mx-auto w-55 h-55 flex items-center justify-center mb-3">
                <img
                  src="/logo.png"
                  alt="App Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex">
                <h2 className="text-3xl font-semibold text-white mb-3">
                  Welcome,
                </h2>
                <h2 className="text-3xl ml-2 font-semibold text-blue-400 mb-3">
                  {loggedInUser?.name || "User"}!
                </h2>
              </div>
              <p className="text-lg text-gray-300 max-w-md">
                Select a conversation from the sidebar or start a new chat to
                begin messaging.
              </p>
            </div>
          ) : isLoadingChat || (selectedUser && uniqueMessages.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-400 text-sm">Loading messages...</p>
            </div>
          ) : (
            <>
              <div className="flex-grow" />
              {uniqueMessages.map((e) => {
                const isSentByMe = e.sender === loggedInUser?._id;

                if (e.reactions && e.reactions.length > 0) {
                  console.log("Message with reactions:", e._id, e.reactions);
                }
                if (e.messageType === "reply") {
                  console.log("Reply message:", e._id, e.repliedMessage);
                }

                return (
                  <div
                    className={`flex flex-col gap-1 mt-2 group-message ${
                      isSentByMe ? "items-end" : "items-start"
                    }`}
                    key={e._id}
                  >
                    <div
                      className={`message-bubble relative group rounded-2xl max-w-[280px] sm:max-w-xs lg:max-w-sm text-sm ${
                        isSentByMe
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none"
                          : "bg-white/10 text-gray-100 backdrop-blur-sm rounded-bl-none"
                      } ${
                        e.messageType === "image" ? "p-1" : "px-3 py-2 sm:px-4"
                      }`}
                      onTouchStart={(event) => {
                        event.preventDefault();
                        setTappedMessage(
                          tappedMessage === e._id ? null : e._id
                        );
                      }}
                    >
                      {e.messageType === "reply" && e.repliedMessage && (
                        <div
                          className={`mb-2 sm:mb-3 p-1.5 sm:p-2 rounded-md border-l-4 ${
                            isSentByMe
                              ? "bg-blue-500/10 border-l-blue-400"
                              : "bg-gray-500/10 border-l-gray-400"
                          }`}
                        >
                          <div className="text-xs font-medium mb-1 opacity-90">
                            {e.repliedMessage.sender === loggedInUser?._id
                              ? "You"
                              : "Other"}
                          </div>

                          <div className="text-sm opacity-75">
                            {e.repliedMessage.messageType === "image" ? (
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                <span>Photo</span>
                              </div>
                            ) : e.repliedMessage.messageType === "deleted" ? (
                              <span className="italic text-gray-400">
                                This message was deleted
                              </span>
                            ) : (
                              <div className="truncate max-w-xs">
                                {e.repliedMessage.text || "Message"}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {e.messageType === "deleted" ? (
                        <p className="italic text-gray-300">
                          This message was deleted
                        </p>
                      ) : (
                        <>
                          {e.messageType === "image" && e.image && (
                            <div className="relative">
                              <img
                                src={e.image.url}
                                alt="shared"
                                className="max-w-full h-auto rounded-2xl border border-white/10"
                              />
                            </div>
                          )}
                          {e.text && (
                            <p className="break-words">
                              {searchQuery
                                ? highlightSearchTerm(e.text, searchQuery)
                                : e.text}
                            </p>
                          )}
                        </>
                      )}

                      <div
                        className={`message-actions absolute -top-6 flex gap-0.5 bg-gray-800/90 backdrop-blur-sm rounded-md p-0.5 shadow-lg transition-opacity duration-200 ${
                          isSentByMe ? "right-2" : "left-2"
                        } ${
                          window.innerWidth < 640
                            ? tappedMessage === e._id
                              ? "opacity-100"
                              : "opacity-0"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isSentByMe &&
                          onDeleteMessage &&
                          e.messageType !== "deleted" && (
                            <button
                              onClick={() => {
                                onDeleteMessage(e._id);
                                setTappedMessage(null);
                              }}
                              className="p-1 bg-gray-700/80 rounded hover:bg-red-500 active:bg-red-500 transition-colors"
                              title="Delete message"
                            >
                              <Trash className="w-3 h-3" />
                            </button>
                          )}

                        {!isSentByMe &&
                          onReplyToMessage &&
                          e.messageType !== "deleted" && (
                            <button
                              onClick={() => {
                                onReplyToMessage(e);
                                setTappedMessage(null);
                              }}
                              className="p-1 bg-gray-700/80 rounded hover:bg-gray-600 active:bg-gray-600 transition-colors"
                              title="Reply"
                            >
                              <Reply className="w-3 h-3" />
                            </button>
                          )}

                        {!isSentByMe &&
                          onAddReaction &&
                          e.messageType !== "deleted" && (
                            <button
                              onClick={() => {
                                setShowReactionPicker(
                                  showReactionPicker === e._id ? null : e._id
                                );
                                setTappedMessage(null);
                              }}
                              className="reaction-button p-1 bg-gray-700/80 rounded hover:bg-gray-600 active:bg-gray-600 transition-colors"
                              title="Add reaction"
                            >
                              <Smile className="w-3 h-3" />
                            </button>
                          )}

                        {onForwardMessage && e.messageType !== "deleted" && (
                          <button
                            onClick={() => {
                              onForwardMessage(e);
                              setTappedMessage(null);
                            }}
                            className="p-1 bg-gray-700/80 rounded hover:bg-gray-600 active:bg-gray-600 transition-colors"
                            title="Forward"
                          >
                            <Forward className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {showReactionPicker === e._id && (
                        <div
                          className={`reaction-picker absolute bottom-full mb-1 bg-gray-900/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-2xl z-50 border border-gray-700/50 animate-in slide-in-from-bottom-1 duration-200 ${
                            isSentByMe
                              ? "right-0 transform translate-x-4"
                              : "left-0 transform -translate-x-4"
                          }`}
                        >
                          <div className="flex gap-1">
                            {commonEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  console.log(
                                    "Emoji clicked:",
                                    emoji,
                                    "for message:",
                                    e._id
                                  );
                                  handleAddReaction(e._id, emoji);
                                }}
                                className="p-1.5 hover:bg-gray-700/50 rounded-full transition-all duration-150 text-base transform hover:scale-110 active:scale-95 min-w-[28px] h-7 flex items-center justify-center"
                                title={`React with ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {e.reactions && e.reactions.length > 0 && (
                      <div
                        className={`flex flex-wrap gap-1 mt-1.5 ${
                          isSentByMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {e.reactions.map((reaction, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border shadow-sm cursor-pointer transition-all duration-200 hover:scale-105 min-h-[20px] ${
                              reaction.userId === loggedInUser?._id
                                ? "bg-blue-500/20 border-blue-400/50 text-blue-300"
                                : "bg-gray-700/80 border-gray-600 text-gray-300 hover:bg-gray-600"
                            }`}
                            title={`${
                              reaction.userId === loggedInUser?._id
                                ? "You"
                                : "Someone"
                            } reacted with ${reaction.emoji}`}
                          >
                            <span className="text-sm leading-none">
                              {reaction.emoji}
                            </span>
                            <span className="text-[10px] font-medium">1</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 mt-1 ${
                        isSentByMe
                          ? "pr-1 sm:pr-2 flex-row-reverse"
                          : "pl-1 sm:pl-2"
                      }`}
                    >
                      <span>
                        {moment(e.createdAt).format("hh:mm A . MMM D")}
                      </span>
                      {isSentByMe &&
                        (e.seen ? (
                          <div className="flex items-center gap-1 text-blue-400">
                            <CheckCheck className="w-3 h-3" />
                            {e.seenAt && (
                              <span>{moment(e.seenAt).format("hh:mm A")}</span>
                            )}
                          </div>
                        ) : (
                          <Check className="w-3 h-3 text-gray-500" />
                        ))}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        <style jsx>{`
          .chat-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .chat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .chat-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          @media (max-width: 768px) {
            .group-message:active .group > div:first-child {
              opacity: 1 !important;
            }
          }

          @media (max-width: 640px) {
            .reaction-picker button {
              min-width: 32px;
              min-height: 32px;
            }
          }
        `}</style>
      </div>
    );
  }
);

export default ChatMessages;
