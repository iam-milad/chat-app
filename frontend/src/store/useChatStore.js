import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingData: null,
  recordingData: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  sendAudioMessage: async (blob) => {
    const { selectedUser, messages } = get();

    try {
      // Convert Blob to base64
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
  
      // Send to backend
      const res = await axiosInstance.post(`/messages/sendAudio/${selectedUser._id}`, {
        audio: `data:audio/mp3;base64,${base64Audio}`
      });

      set({ messages: [...messages, res.data] });
  
      console.log("Uploaded audio message:", res.data);
    } catch (err) {
      console.error("Failed to upload audio:", err);
      throw err;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("isTyping", (typingData) => {
      set({ typingData });
    });

    socket.on("isRecordingAudio", (recordingData) => {
      set({ recordingData });
    });
  },

  isUserTyping: (senderId, recipientId, isTyping) => {
    const socket = useAuthStore.getState().socket;

    socket.emit('isTyping', {
      senderId,
      recipientId,
      isTyping,
    });
  },

  isUserRecordingAudio: (senderId, recipientId, isRecordingAudio) => {
    const socket = useAuthStore.getState().socket;

    socket.emit('isRecordingAudio', {
      senderId,
      recipientId,
      isRecordingAudio,
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
