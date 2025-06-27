const UnreadMessagesSeparator = () => {
  return (
    <div className="flex items-center my-4 px-4 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="flex-1 h-px bg-red-300"></div>
      <span className="px-3 text-sm text-red-500 bg-base-100 font-medium">
        Unread Messages
      </span>
      <div className="flex-1 h-px bg-red-300"></div>
    </div>
  );
};

export default UnreadMessagesSeparator;
