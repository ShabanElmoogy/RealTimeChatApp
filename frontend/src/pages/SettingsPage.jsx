import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useChatStore } from "../store/useChatStore";
import { Send, Trash2 } from "lucide-react";
import { useState } from "react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { deleteAllMessages } = useChatStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAllMessages = () => {
    deleteAllMessages();
    setShowDeleteModal(false);
  };

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl space-y-10">
      
      {/* Danger Zone */}
      <section className="border border-red-500 rounded-lg p-5 bg-red-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
            <p className="text-sm text-red-600/80">Permanently delete all messages from all conversations.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-error btn-sm"
          >
            <Trash2 size={16} className="mr-1" />
            Delete All
          </button>
        </div>
      </section>

      {/* Theme Selector */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">Choose a theme for your chat interface.</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${
                theme === t ? "bg-base-200" : "hover:bg-base-200/50"
              }`}
            >
              <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Chat Preview */}
      <section className="rounded-xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-base-200">
          <div className="max-w-md mx-auto space-y-4">
            {/* Chat Header */}
            <div className="flex items-center gap-3 border-b border-base-300 pb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                J
              </div>
              <div>
                <h3 className="font-medium text-sm">John Doe</h3>
                <p className="text-xs text-base-content/70">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {PREVIEW_MESSAGES.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                >
                  <div className={`
                    max-w-[75%] rounded-xl p-3 shadow text-sm
                    ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}
                  `}>
                    {message.content}
                    <p className={`text-[10px] mt-1 ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}`}>
                      12:00 PM
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Preview */}
            <div className="flex gap-2 pt-2 border-t border-base-300">
              <input
                type="text"
                className="input input-bordered flex-1 text-sm h-10"
                placeholder="Type a message..."
                value="This is a preview"
                readOnly
              />
              <button className="btn btn-primary h-10 min-h-0">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-red-600">Delete All Messages</h3>
            <p className="py-4">
              Are you sure you want to delete <strong>ALL messages</strong>? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button onClick={() => setShowDeleteModal(false)} className="btn">
                Cancel
              </button>
              <button onClick={handleDeleteAllMessages} className="btn btn-error">
                <Trash2 size={16} className="mr-1" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
