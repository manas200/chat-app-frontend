import {
  Loader2,
  Paperclip,
  Send,
  X,
  Smile,
  Reply,
  XCircle,
  ImageIcon,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Message } from "@/app/chat/page";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (value: string) => void;
  handleMessageSend: (
    e: any,
    imageFile?: File | null,
    replyTo?: string
  ) => void;
  replyingToMessage?: Message | null;
  setReplyingToMessage?: (message: Message | null) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
  replyingToMessage,
  setReplyingToMessage,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    console.log("Sending message with reply:", {
      message,
      imageFile: !!imageFile,
      replyingToMessage: replyingToMessage?._id
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(message + emojiData.emoji);
  };

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
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-24 h-24 object-cover rounded-lg border border-gray-600"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-black rounded-full p-1 hover:bg-gray-800 transition-colors"
            onClick={() => setImageFile(null)}
            title="Remove image"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Attachment */}
        <label
          className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg px-2 sm:px-3 py-2 transition-colors touch:bg-gray-600"
          title="Attach image"
        >
          <Paperclip size={16} className="text-gray-300 sm:w-[18px] sm:h-[18px]" />
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

        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-600 rounded-lg px-2 sm:px-3 py-2 transition-colors touch:bg-gray-600"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title="Add emoji"
          >
            <Smile size={16} className="text-gray-300 sm:w-[18px] sm:h-[18px]" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 sm:left-0 z-50 transform sm:transform-none">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={Theme.DARK}
                searchDisabled={false}
                skinTonesDisabled={true}
                width={window.innerWidth > 640 ? 280 : Math.min(280, window.innerWidth - 40)}
                height={window.innerWidth > 640 ? 350 : 300}
              />
            </div>
          )}
        </div>

        {/* Input Field */}
        <input
          type="text"
          className="flex-1 bg-gray-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-gray-400 border border-transparent focus:border-blue-500 focus:outline-none transition-colors"
          placeholder={imageFile ? "Add a caption..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!imageFile && !message.trim()) || isUploading}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-white transform hover:scale-105 disabled:hover:scale-100 transition-transform touch:scale-100"
          title="Send message"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
