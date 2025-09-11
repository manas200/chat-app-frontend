"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { chat_service, useAppData } from "./AppContext";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

interface ProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppData();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user?._id) return;

    console.log("🔌 Connecting to chat service:", chat_service);
    console.log("👤 User ID for socket:", user._id);

    const newSocket = io(chat_service, {
      query: {
        userId: user._id,
      },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUser", (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      newSocket.off("getOnlineUser");
      newSocket.off("connect_error");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, [user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    // Listen for reaction updates - these are handled in the main chat page
    // This is just for debugging and connection verification
    const handleMessageReaction = (data: {
      messageId: string;
      reactions: any[];
    }) => {
      console.log("Socket received reaction update:", data);
    };

    const handleConnect = () => {
      console.log("Socket connected successfully:", socket.id);
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = () => useContext(SocketContext);
