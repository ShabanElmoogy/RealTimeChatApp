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

  // Mark messages as read when separator comes into view
  const handleIntersection = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.classList.contains('unread-separator')) {
        markMessagesAsRead(selectedUser._id);
      }
    });
  }, [selectedUser._id, markMessagesAsRead]);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Set up intersection observer for separator
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '0px'
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection]);

  // Scroll to separator when messages load
  useEffect(() => {
    if (messages.length === 0) return;
    
    const firstUnreadIndex = getFirstUnreadMessageIndex();
    
    // Always scroll to bottom first, then to separator if needed
    setTimeout(() => {
      if (firstUnreadIndex !== -1) {
        // Has unread messages - find and scroll to separator
        const separatorElement = document.querySelector('.unread-separator');
        if (separatorElement) {
          separatorElement.scrollIntoView({ behavior: "auto", block: "center" });
          return;
        }
      }
      
      // No unread messages or separator not found - scroll to bottom
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 100);
  }, [messages.length, selectedUser._id]); // Only depend on messages length and user change

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
          const firstUnreadIndex = getFirstUnreadMessageIndex();
          const isFirstUnreadMessage = index === firstUnreadIndex && firstUnreadIndex !== -1;
          const isUnreadMessage = message.receiverId === authUser._id && !message.isRead;
          
          return (
            <div key={message._id}>
              {isFirstUnreadMessage && (
                <div 
                  ref={(el) => {
                    unreadSeparatorRef.current = el;
                    if (el && observerRef.current) {
                      el.classList.add('unread-separator');
                      observerRef.current.observe(el);
                    }
                  }}
                  onClick={() => markMessagesAsRead(selectedUser._id)}
                >
                  <UnreadMessagesSeparator />
                </div>
              )}
              <div
                className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                ref={(el) => {
                  if (index === messages.length - 1) messageEndRef.current = el;
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
