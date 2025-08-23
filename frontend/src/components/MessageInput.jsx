import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

import Recorder from "./Recorder";
import AnimatedMic from "./AnimatedMic";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser, isUserTyping, typingData, recordingData } =
    useChatStore();
  const { authUser } = useAuthStore();

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
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      isUserTyping(authUser._id, selectedUser._id, false);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleMessageTyping = (e) => {
    const { value } = e.target;
    const isTyping = value.length > 0;

    isUserTyping(authUser._id, selectedUser._id, isTyping);
    setText(value);
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

      {typingData?.isTyping && (
        <div className="flex gap-2 items-center mb-2">
          <div className="chat-image avatar">
            <div className="size-6 rounded-full border">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt="profile pic"
              />
            </div>
          </div>
          <span className="loading loading-dots loading-sm"></span>
          <pre className="text-[10px] opacity-50 ml-1">
            <b>{selectedUser.fullName}</b> is typing
          </pre>
        </div>
      )}

      {recordingData?.isRecordingAudio && (
        <div className="flex gap-2 items-center mb-2">
          <div className="chat-image avatar">
            <div className="size-6 rounded-full border">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt="profile pic"
              />
            </div>
          </div>
          <AnimatedMic />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {!isRecording && (
          <div className="flex-1 flex gap-2 items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type="button"
              className={`sm:flex btn btn-circle
            ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={handleMessageTyping}
            />
          </div>
        )}

        <Recorder isRecording={isRecording} setIsRecording={setIsRecording} />

        {!isRecording && (
          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={22} />
          </button>
        )}
      </form>
    </div>
  );
};
export default MessageInput;
