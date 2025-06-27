import { useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, User, Calendar, Image, FileText, ExternalLink, Shield, UserMinus } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const UserInfoPanel = ({ onClose }) => {
  const { selectedUser, messages } = useChatStore();
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("info");

  // Temporary placeholders - will be replaced with actual friend store
  const isBlocked = false;
  const isFriend = false;

  // Filter messages with files/images
  const filesAndImages = useMemo(() => {
    return messages
      .filter(msg => msg.image || msg.fileMetadata)
      .map(msg => ({
        ...msg,
        type: msg.fileMetadata ? 'file' : 'image',
        displayName: msg.fileMetadata?.originalName || 'Image',
        size: msg.fileMetadata?.fileSize,
        fileType: msg.fileMetadata?.fileType
      }))
      .reverse(); // Most recent first
  }, [messages]);

  const handleBlockUser = () => {
    // TODO: Implement block/unblock functionality
    console.log(isBlocked ? 'Unblocking user:' : 'Blocking user:', selectedUser._id);
  };

  const handleRemoveFriend = () => {
    // TODO: Implement remove friend functionality
    console.log('Removing friend:', selectedUser._id);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const openFileInNewTab = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="w-80 bg-base-200 border-l border-base-300 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <h3 className="font-semibold text-lg">User Details</h3>
        <button 
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-base-300 flex flex-col items-center">
        <div className="avatar mb-3">
          <div className="w-20 h-20 rounded-full border-2 border-base-300">
            <img 
              src={selectedUser.profilePic || "/avatar.png"} 
              alt={selectedUser.fullName}
            />
          </div>
        </div>
        <h4 className="font-semibold text-lg">{selectedUser.fullName}</h4>
        <p className="text-sm text-base-content/70">@{selectedUser.username}</p>
        {selectedUser.email && (
          <p className="text-sm text-base-content/70">{selectedUser.email}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mx-4 my-2">
        <button 
          className={`tab flex-1 ${activeTab === "info" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <User className="w-4 h-4 mr-1" />
          Info
        </button>
        <button 
          className={`tab flex-1 ${activeTab === "media" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("media")}
        >
          <Image className="w-4 h-4 mr-1" />
          Media
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "info" && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-base-content/60" />
                <span className="text-base-content/70">
                  Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {selectedUser.lastSeen && (
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-base-content/70">
                    {selectedUser.isOnline ? 'Online' : `Last seen ${formatMessageTime(selectedUser.lastSeen)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              {isFriend && (
                <button
                  onClick={handleRemoveFriend}
                  className="btn btn-outline btn-warning w-full"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove Friend
                </button>
              )}
              
              <button
                onClick={handleBlockUser}
                className={`btn w-full ${isBlocked ? 'btn-success' : 'btn-error'}`}
              >
                <Shield className="w-4 h-4" />
                {isBlocked ? 'Unblock User' : 'Block User'}
              </button>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-3">
            {filesAndImages.length === 0 ? (
              <div className="text-center text-base-content/60 py-8">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No files or images shared</p>
              </div>
            ) : (
              filesAndImages.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-base-300 hover:bg-base-100 transition-colors"
                >
                  {item.type === 'image' ? (
                    <div className="w-12 h-12 rounded bg-base-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt="Shared image" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded bg-base-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-base-content/60" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.displayName}</p>
                    <div className="flex items-center gap-2 text-xs text-base-content/60">
                      <span>{formatMessageTime(item.createdAt)}</span>
                      {item.size && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(item.size)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openFileInNewTab(item.image)}
                    className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoPanel;
