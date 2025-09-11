import { Message } from "@/app/chat/page";
import { User } from "@/context/AppContext";
import { SocketData } from "@/context/SocketContext";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import moment from "moment";
import { Check, CheckCheck, Zap, Trash } from "lucide-react";

interface ChatMessagesProps {
  selectedUser: string | null;
  messages: Message[] | null;
  loggedInUser: User | null;
  onDeleteMessage?: (messageId: string) => void;
}

const ChatMessages = React.memo(
  ({
    selectedUser,
    messages,
    loggedInUser,
    onDeleteMessage,
  }: ChatMessagesProps) => {
    const { socket } = SocketData();
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollbar, setShowScrollbar] = useState(false);
    const [localMessages, setLocalMessages] = useState<Message[]>(
      messages || []
    );

    // Sync prop messages with local state
    useEffect(() => {
      setLocalMessages(messages || []);
    }, [messages]);

    // Socket listener for deleted messages
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
                  deleted: true,
                  text: "",
                  image: undefined,
                  messageType: "deleted",
                } // ✅ set messageType
              : msg
          )
        );
      };

      socket.on("messageDeleted", handleMessageDeleted);
      return () => {
        socket.off("messageDeleted", handleMessageDeleted);
      };
    }, [socket, selectedUser]);

    // Remove duplicates
    const uniqueMessages = useMemo(() => {
      const seen = new Set();
      return localMessages.filter((msg) => {
        if (seen.has(msg._id)) return false;
        seen.add(msg._id);
        return true;
      });
    }, [localMessages]);

    // Scroll handling
    const scrollToBottom = useCallback((smooth: boolean) => {
      if (!scrollRef.current || !bottomRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (isNearBottom) {
        bottomRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
        });
      }
    }, []);

    useEffect(() => {
      scrollToBottom(true);
    }, [uniqueMessages, selectedUser, scrollToBottom]);

    // Temporary scrollbar on scroll
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

    return (
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className={`h-full max-h-[calc(100vh-215px)] overflow-y-auto p-2 space-y-2 chat-scroll ${
            showScrollbar ? "show" : ""
          }`}
          style={{
            scrollbarGutter: "stable",
            scrollBehavior: "smooth",
            willChange: "transform",
          }}
        >
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="mx-auto w-40 h-40 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/40">
                <Zap width={120} height={120} />
              </div>
              <h2 className="text-4xl font-semibold text-white mb-5">
                Welcome to Pulse
              </h2>
              <p className="text-xl text-gray-300 max-w-md">
                Select a conversation from the sidebar or start a new chat to
                begin messaging.
              </p>
            </div>
          ) : (
            <>
              {uniqueMessages.map((e) => {
                const isSentByMe = e.sender === loggedInUser?._id;
                return (
                  <div
                    className={`flex flex-col gap-1 mt-2 ${
                      isSentByMe ? "items-end" : "items-start"
                    }`}
                    key={e._id}
                  >
                    <div
                      className={`relative group rounded-lg max-w-sm text-sm ${
                        isSentByMe
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                          : "bg-white/10 text-gray-100 mr-8 backdrop-blur-sm"
                      } ${e.messageType === "image" ? "p-1" : "px-3 py-2"}`}
                    >
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
                                className="max-w-full h-auto rounded-lg border border-white/10"
                              />
                            </div>
                          )}
                          {e.text && <p>{e.text}</p>}
                        </>
                      )}

                      {isSentByMe &&
                        onDeleteMessage &&
                        e.messageType !== "deleted" && (
                          <button
                            onClick={() => onDeleteMessage(e._id)}
                            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete message"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                    </div>

                    <div
                      className={`flex items-center gap-1 text-[11px] text-gray-400 ${
                        isSentByMe ? "pr-2 flex-row-reverse" : "pl-2"
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
      </div>
    );
  }
);

export default ChatMessages;
