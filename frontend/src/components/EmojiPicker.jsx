import { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Smile } from "lucide-react";

const EmojiPickerComponent = ({ onEmojiClick }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    onEmojiClick(emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <Smile size={20} />
      </button>
      
      {showPicker && (
        <div className="absolute bottom-12 right-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
            theme="auto"
            searchDisabled={false}
            skinTonesDisabled={false}
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;