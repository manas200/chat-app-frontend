import React from "react";
import { Smile } from "lucide-react";

interface ReactionPickerProps {
  messageId: string;
  onReactionSelect: (emoji: string) => void;
}

const ReactionPicker: React.FC<ReactionPickerProps> = ({
  messageId,
  onReactionSelect,
}) => {
  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  return (
    <div className="absolute bottom-full left-0 bg-gray-800 rounded-lg p-2 shadow-lg z-10">
      <div className="flex gap-1">
        {commonEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReactionSelect(emoji)}
            className="p-1 hover:bg-gray-700 rounded transition-colors text-lg"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionPicker;
