import { FaUserCircle, FaSearch, FaFilter, FaSave, FaRegPaperPlane } from "react-icons/fa";
import { useState } from "react";
import { TbMessageCirclePlus } from "react-icons/tb";
import { HiFolderArrowDown } from "react-icons/hi2";
import { IoFilterOutline } from "react-icons/io5";

interface Chat {
  id: string;
  name: string;
  last_opened_at?: string | null;
  labels?: string[];
}

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  onUserSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  userSearch: string;
  userResults: any[];
  searching: boolean;
  onStartChat: (userId: string) => void;
  onShowAddChat: () => void;
  onDeleteChat?: () => void;
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return new Date().toLocaleDateString();
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  onUserSearch,
  userSearch,
  userResults,
  searching,
  onStartChat,
  onShowAddChat,
  onDeleteChat,
}: ChatListProps) {
  const [directName, setDirectName] = useState("");
  const [label, setLabel] = useState("");

  return (
    <aside className="w-[440px] bg-white border-r border-[#e6e6e6] flex flex-col relative">
      {/* Custom filter row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e6e6e6] bg-[#f7f8fa] relative">
        <p className=" text-[#04904d] px-1 py-1 rounded font-bold text-[16px] flex items-center">
          <span><HiFolderArrowDown /></span>Custom filter</p>
        <button className="bg-white text-[#222] p-1 rounded font-medium text-sm flex items-center gap-1">Save</button>
        <div className="flex-1 flex items-center bg-white rounded px-2 py-1 ml-2 relative max-w-[100px]">
          <span className="text-[#222] mr-2"><FaSearch /></span>
          <input
            className="bg-transparent outline-none text-sm flex-1 w-full placeholder:text-black"
            placeholder="Search"
            value={userSearch}
            onChange={onUserSearch}
          />
        </div>
        <button className="ml-2 flex items-center gap-2 bg-white p-1 rounded">
          <span className="text-[#04904d]"><IoFilterOutline /></span>
          <span className="text-[#04904d] font-semibold">Filtered</span>
        </button>
      </div>
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats
          .filter(chat => chat.name.toLowerCase().includes(userSearch.toLowerCase()))
          .length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#888] p-8">
            <FaRegPaperPlane size={48} className="mb-4" />
            <div className="text-lg font-semibold mb-2">No chats yet</div>
            <div className="text-sm">Start a new chat using the green + button below!</div>
          </div>
        ) : (
          chats
            .filter(chat => chat.name.toLowerCase().includes(userSearch.toLowerCase()))
            .map((chat) => (
              <div
                key={chat.id}
                data-chat-id={chat.id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-[#f2f2f2] cursor-pointer hover:bg-[#f7f8fa] ${selectedChat === chat.id ? "bg-[#f7f8fa]" : ""}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <span className="text-[#888]"><FaUserCircle size={36} /></span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#222] text-sm">{chat.name}</span>
                    {chat.labels && chat.labels.length > 0 && (
                      <div className="flex gap-1">
                        {chat.labels.map(label => (
                          <span key={label} className="bg-[#e6f9ec] text-[#25d366] px-2 py-0.5 rounded text-xs font-medium">{label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span></span>
                    <span className="text-xs text-[#888] ml-2">{formatDate(chat.last_opened_at)}</span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
      {/* Add Chat Floating Button */}
      <button
        className="absolute bottom-6 right-[10px] z-30 bg-[#04904d] hover:bg-[#1fa855] text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-200"
        style={{ transform: 'translateX(-50%)' }}
        onClick={onShowAddChat}
      >
        <TbMessageCirclePlus size={24} />
      </button>
    </aside>
  );
} 