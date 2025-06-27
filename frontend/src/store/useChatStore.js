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

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.message);
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
      toast.error(error.message);
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
      toast.error(error.message);
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

    socket.on("messagesRead", ({ readerId }) => {
      const { messages } = get();
      const updatedMessages = messages.map(message => 
        message.receiverId === readerId ? { ...message, isRead: true } : message
      );
      set({ messages: updatedMessages });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messagesRead");
  },

  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.patch(`/messages/read/${userId}`);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  deleteAllMessages: async () => {
    try {
      await axiosInstance.delete("/messages/delete");
      set({ messages: [] });
      toast.success("All messages deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete messages");
    }
  },

  getFirstUnreadMessageIndex: () => {
    const { messages } = get();
    const { authUser } = useAuthStore.getState();
    
    return messages.findIndex(message => 
      message.receiverId === authUser._id && !message.isRead
    );
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
