import {
  Loader2,
  Paperclip,
  Send,
  X,
  Smile,
  Reply,
  XCircle,
  ImageIcon,
  Pencil,
  Check,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Message } from "@/app/chat/page";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (value: string) => void;
  handleMessageSend: (
    e: React.FormEvent,
    imageFile?: File | null,
    replyTo?: string
  ) => void;
  handleEditSubmit?: (e: React.FormEvent, editedText: string) => void;
  replyingToMessage?: Message | null;
  setReplyingToMessage?: (message: Message | null) => void;
  editingMessage?: Message | null;
  setEditingMessage?: (message: Message | null) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
  handleEditSubmit,
  replyingToMessage,
  setReplyingToMessage,
  editingMessage,
  setEditingMessage,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    // Handle edit mode
    if (editingMessage && handleEditSubmit) {
      console.log("Editing message:", {
        messageId: editingMessage._id,
        newText: message,
      });

      setIsUploading(true);
      try {
        await handleEditSubmit(e, message);
        setMessage("");
      } catch (error) {
        console.error("Error editing message:", error);
      } finally {
        setIsUploading(false);
        setShowEmojiPicker(false);
      }
      return;
    }

    // Handle normal send
    console.log("Sending message with reply:", {
      message,
      imageFile: !!imageFile,
      replyingToMessage: replyingToMessage?._id,
    });

    setIsUploading(true);
    try {
      await handleMessageSend(e, imageFile, replyingToMessage?._id);
      setImageFile(null);
      setMessage("");
      setReplyingToMessage?.(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsUploading(false);
      setShowEmojiPicker(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingMessage?.(null);
    setMessage("");
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(message + emojiData.emoji);
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  if (!selectedUser) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1 sm:gap-2 border-t border-gray-700 pt-1 sm:pt-2 relative"
    >
      {/* Edit Message Preview */}
      {editingMessage && !replyingToMessage && (
        <div className="bg-gray-800 p-2 sm:p-3 rounded-lg mb-1 sm:mb-2 relative border-l-4 border-amber-500">
          <div className="flex items-start gap-2">
            <Pencil className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-400 font-medium mb-1">
                Editing message
              </p>
              <div className="text-sm text-gray-300 border-l-2 border-amber-400 pl-2">
                <span className="truncate block">
                  {editingMessage.text || "Message"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-white flex-shrink-0 transition-colors"
              title="Cancel edit"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Reply Preview */}
      {replyingToMessage && (
        <div className="bg-gray-800 p-2 sm:p-3 rounded-lg mb-1 sm:mb-2 relative border-l-4 border-blue-500">
          <div className="flex items-start gap-2">
            <Reply className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-400 font-medium mb-1">
                Replying to
              </p>
              <div className="text-sm text-gray-300 border-l-2 border-blue-400 pl-2">
                {replyingToMessage.messageType === "image" ? (
                  <div className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Image</span>
                  </div>
                ) : replyingToMessage.messageType === "deleted" ? (
                  <span className="italic text-gray-400">Deleted message</span>
                ) : (
                  <span className="truncate">
                    {replyingToMessage.text || "Message"}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReplyingToMessage?.(null)}
              className="text-gray-400 hover:text-white flex-shrink-0 transition-colors"
              title="Cancel reply"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {imageFile && (
        <div className="relative w-fit mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-600"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-black rounded-full p-1 hover:bg-gray-800 transition-colors z-10"
            onClick={() => setImageFile(null)}
            title="Remove image"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-2 min-h-[44px]">
        {/* Attachment */}
        <label
          className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg px-2 sm:px-3 py-2 transition-colors touch:bg-gray-600 flex-shrink-0"
          title="Attach image"
        >
          <Paperclip
            size={16}
            className="text-gray-300 sm:w-[18px] sm:h-[18px]"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.type.startsWith("image/")) {
                setImageFile(file);
              }
            }}
          />
        </label>

        <div className="relative flex-shrink-0" ref={pickerRef}>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-600 rounded-lg px-2 sm:px-3 py-2 transition-colors touch:bg-gray-600"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="Add emoji"
          >
            <Smile
              size={16}
              className="text-gray-300 sm:w-[18px] sm:h-[18px]"
            />
          </button>

          {showEmojiPicker && (
            <div
              className={`absolute bottom-12 z-50 ${
                isMobile
                  ? "right-0 transform translate-x-full -mr-80"
                  : "left-0"
              }`}
              style={
                isMobile
                  ? {
                      right: "0px",
                      transform: "translateX(calc(-140% + 10px))",
                    }
                  : {}
              }
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={Theme.DARK}
                searchDisabled={false}
                skinTonesDisabled={true}
                width={
                  isMobile
                    ? Math.min(
                        280,
                        (typeof window !== "undefined"
                          ? window.innerWidth
                          : 320) - 16
                      )
                    : 280
                }
                height={isMobile ? 300 : 350}
              />
            </div>
          )}
        </div>

        <input
          type="text"
          className={`flex-1 min-w-0 bg-gray-700 rounded-lg px-3 sm:px-4 py-3 text-sm sm:text-base text-white placeholder-gray-400 border border-transparent focus:outline-none transition-colors ${
            editingMessage ? "focus:border-amber-500" : "focus:border-blue-500"
          }`}
          placeholder={
            editingMessage
              ? "Edit your message..."
              : imageFile
              ? "Add a caption..."
              : "Type a message..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          autoFocus={!!editingMessage}
        />

        <button
          type="submit"
          disabled={(!imageFile && !message.trim()) || isUploading}
          className={`px-3 sm:px-4 py-3 rounded-lg transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-white transform hover:scale-105 disabled:hover:scale-100 flex-shrink-0 ${
            editingMessage
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          }`}
          title={editingMessage ? "Save edit" : "Send message"}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : editingMessage ? (
            <Check className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
