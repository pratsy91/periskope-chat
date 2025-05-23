import { FaUserCircle, FaSearch, FaEllipsisV, FaUsers } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { BsStars } from "react-icons/bs";

interface ChatHeaderProps {
  chatName: string | null;
  userCount?: number;
  members?: Array<{ id: string; username: string }>;
  onSearchUser?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchResults?: Array<{ id: string; username: string }>;
  onSelectUser?: (user: { id: string; username: string }) => void;
  onDeleteChat?: () => void;
}

export default function ChatHeader({ 
  chatName, 
  userCount = 0, 
  members = [],
  onSearchUser,
  searchResults = [],
  onSelectUser,
  onDeleteChat
}: ChatHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const isGroup = members.length > 2;
  const leftAvatar = members[0];
  const rightAvatars = isGroup ? members.slice(1, 5) : [];
  const extraCount = isGroup ? Math.max(0, members.length - 5) : 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchUser?.(e);
  };

  const handleSelectUser = (user: { id: string; username: string }) => {
    if (members.some(member => member.id === user.id)) {
      setToastMessage(`${user.username} is already a member of this chat`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    onSelectUser?.(user);
    setSearchQuery("");
    setShowSearch(false);
  };

  // Ref and effect for click-outside-to-close on options dropdown
  const optionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showOptions) return;
    function handleClickOutside(event: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  return (
    <header className="h-[56px] border-b border-[#e6e6e6] bg-white flex items-center justify-between px-4">
      {/* Toast message */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}
      
      {/* Left avatar and chat info */}
      <div className="flex items-center gap-3">
        {/* Left avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          {isGroup ? (
            <div className="w-full h-full flex items-center justify-center">
              <FaUsers size={24} className="text-gray-500" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUserCircle size={32} className="text-gray-500" />
            </div>
          )}
        </div>
        <div>
          <h1 className="font-semibold text-[#222]">{chatName || "Select a chat"}</h1>
          {userCount > 0 && (
            <p className="text-xs text-[#888]">{userCount} {userCount === 1 ? 'member' : 'members'}</p>
          )}
        </div>
      </div>
      {/* Right avatars, search, and options */}
      <div className="flex items-center gap-2 relative">
        {isGroup && (
          <div className="flex -space-x-2 mr-2">
            {rightAvatars.map((member) => (
              <div
                key={member.id}
                className="w-10 h-10 rounded-full overflow-hidden bg-gray-100"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <FaUserCircle size={32} className="text-gray-500" />
                </div>
              </div>
            ))}
            {extraCount > 0 && (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-700">
                  +{extraCount}
                </div>
              </div>
            )}
          </div>
        )}
        <BsStars size={18} className="text-[#5d6873]"/>
        {showSearch ? (
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-3 py-1 border border-[#e6e6e6] rounded text-sm w-[200px]"
              autoFocus
            />
            {searchQuery && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#e6e6e6] rounded shadow-lg w-[200px] z-10">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-[#f7f8fa] cursor-pointer text-sm flex items-center"
                    onClick={() => handleSelectUser(user)}
                  >
                    <span className="text-[#25d366] mr-2"><FaUserCircle size={18} /></span>
                    {user.username}
                  </div>
                ))}
              </div>
            )}
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888]"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <button 
            className="text-[#888] hover:text-[#222] p-2"
            onClick={() => setShowSearch(true)}
            title="Add users to chat"
          >
            <FaSearch size={20} />
          </button>
        )}
        {/* Three dots options icon */}
        <button
          className="text-[#888] hover:text-[#222] p-2"
          onClick={() => setShowOptions(v => !v)}
          title="Options"
        >
          <FaEllipsisV size={20} />
        </button>
        {/* Options dropdown */}
        {showOptions && (
          <div ref={optionsRef} className="absolute right-0 top-10 bg-white border border-[#e6e6e6] rounded shadow p-2 z-30 min-w-[120px] flex flex-col items-end">
            <button
              onClick={() => { setShowDeleteConfirm(true); setShowOptions(false); }}
              className="text-red-500 hover:bg-[#f7f8fa] px-3 py-1 rounded text-sm w-full text-right"
            >
              Delete Chat
            </button>
          </div>
        )}
        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] flex flex-col items-center">
              <div className="text-lg font-semibold mb-4">Are you sure you want to delete this chat?</div>
              <div className="flex gap-4">
                <button
                  className="bg-[#e6e6e6] text-[#222] px-4 py-2 rounded hover:bg-[#f7f8fa]"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => { setShowDeleteConfirm(false); onDeleteChat && onDeleteChat(); }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 