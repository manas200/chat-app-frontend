import { Loader2, Paperclip, Send, X, Smile } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface MessageInputProps {
  selectedUser: string | null;
  message: string;
  setMessage: (value: string) => void;
  handleMessageSend: (e: any, imageFile?: File | null) => void;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  handleMessageSend,
}: MessageInputProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return;

    setIsUploading(true);
    handleMessageSend(e, imageFile);
    setImageFile(null);
    setIsUploading(false);
    setShowEmojiPicker(false);
    setMessage("");
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
      className="flex flex-col gap-2 border-t border-gray-700 pt-2 relative"
    >
      {imageFile && (
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-24 h-24 object-cover rounded-lg border border-gray-600"
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-black rounded-full p-1"
            onClick={() => setImageFile(null)}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Attachment */}
        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors">
          <Paperclip size={18} className="text-gray-300" />
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
            className="bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 transition-colors"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile size={18} className="text-gray-300" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
            </div>
          )}
        </div>

        {/* Input Field */}
        <input
          type="text"
          className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400"
          placeholder={imageFile ? "Add a caption..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!imageFile && !message) || isUploading}
          className="bg-gradient-to-r hover:bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed text-white"
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
