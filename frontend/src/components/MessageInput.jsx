import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPickerComponent from "./EmojiPicker";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const [sending, setSending] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

const handleSendMessage = async (e) => {
  e.preventDefault();
  if (sending || (!text.trim() && !imagePreview)) return;

  setSending(true);
  try {
    await sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    // Clear form
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (error) {
    console.error("Failed to send message:", error);
    toast.error("Failed to send message");
  } finally {
    setSending(false); // Reset sending state
  }
};

 const handleEmojiClick = (emoji) => {
    setText(prev => prev + emoji);
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
           <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

    <form
      onSubmit={handleSendMessage}
      className="flex flex-col sm:flex-row items-end sm:items-center gap-2"
    >
      <div className="flex w-full gap-2 items-center">
        <input
          type="text"
          className="flex-1 input input-bordered rounded-lg input-sm sm:input-md"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </div>

      <div className="flex gap-2 self-end sm:self-auto">
        <button
          type="button"
          className={`btn btn-circle btn-sm ${
            imagePreview ? "text-emerald-500" : "text-zinc-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={20} />
        </button>

        <EmojiPickerComponent onEmojiClick={handleEmojiClick} />

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={sending || (!text.trim() && !imagePreview)}
        >
          <Send size={22} />
        </button>
      </div>
    </form>

    </div>
  );
};
export default MessageInput;
