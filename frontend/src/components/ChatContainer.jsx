import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useCallback, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import UnreadMessagesSeparator from "./UnreadMessagesSeparator";
import UserInfoPanel from "./UserInfoPanel";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { CheckCheck, Check } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
    getFirstUnreadMessageIndex,
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const messageEndRef = useRef(null);
  const unreadSeparatorRef = useRef(null);
  const observerRef = useRef(null);
  const unreadMessagesRef = useRef(new Set());

  // Mark messages as read when they come into view
  const handleIntersection = useCallback((entries) => {
    const visibleUnreadMessages = entries
      .filter(entry => entry.isIntersecting && unreadMessagesRef.current.has(entry.target.dataset.messageId))
      .map(entry => entry.target.dataset.messageId);

    if (visibleUnreadMessages.length > 0) {
      markMessagesAsRead(selectedUser._id);
      visibleUnreadMessages.forEach(messageId => {
        unreadMessagesRef.current.delete(messageId);
      });
    }
  }, [selectedUser._id, markMessagesAsRead]);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Set up intersection observer for unread messages
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
      rootMargin: '0px'
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  useEffect(() => {
    if (messages.length > 0) {
      const firstUnreadIndex = getFirstUnreadMessageIndex();
      
      // Clean up intersection observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (firstUnreadIndex !== -1 && unreadSeparatorRef.current) {
        // Scroll to unread separator if there are unread messages
        setTimeout(() => {
          unreadSeparatorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else {
        // Clear unread tracking if no unread messages
        unreadMessagesRef.current.clear();
        if (messageEndRef.current) {
          // Scroll to bottom if no unread messages
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages, getFirstUnreadMessageIndex]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex overflow-auto">
        <div className="flex-1 flex flex-col">
          <ChatHeader onToggleUserInfo={() => setShowUserInfo(!showUserInfo)} showUserInfo={showUserInfo} />
          <MessageSkeleton />
          <MessageInput />
        </div>
        {showUserInfo && <UserInfoPanel onClose={() => setShowUserInfo(false)} />}
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-auto">
      <div className="flex-1 flex flex-col">
        <ChatHeader onToggleUserInfo={() => setShowUserInfo(!showUserInfo)} showUserInfo={showUserInfo} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isFirstUnreadMessage = index === getFirstUnreadMessageIndex();
          const isUnreadMessage = message.receiverId === authUser._id && !message.isRead;
          
          // Track unread messages for intersection observer
          if (isUnreadMessage) {
            unreadMessagesRef.current.add(message._id);
          }
          
          return (
            <div key={message._id}>
              {isFirstUnreadMessage && (
                <div 
                  ref={unreadSeparatorRef}
                  onClick={() => {
                    markMessagesAsRead(selectedUser._id);
                    unreadMessagesRef.current.clear();
                  }}
                >
                  <UnreadMessagesSeparator />
                </div>
              )}
              <div
                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                ref={(el) => {
                  if (index === messages.length - 1) messageEndRef.current = el;
                  if (isUnreadMessage && el && observerRef.current) {
                    el.dataset.messageId = message._id;
                    observerRef.current.observe(el);
                  }
                }}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId === authUser._id
                          ? authUser.profilePic || "/avatar.png"
                          : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  {message.senderId === authUser._id && (
                    <div className="flex justify-end mt-1">
                      {message.isRead ? (
                        <CheckCheck className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Check className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>

        <MessageInput />
      </div>
      {showUserInfo && <UserInfoPanel onClose={() => setShowUserInfo(false)} />}
    </div>
  );
};
export default ChatContainer;
