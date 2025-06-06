import { FaUserCircle, FaSearch, FaFilter, FaSave, FaRegPaperPlane, FaPlus, FaUsers } from "react-icons/fa";
import { useState, useEffect } from "react";
import { TbMessageCirclePlus } from "react-icons/tb";
import { HiFolderArrowDown } from "react-icons/hi2";
import { IoFilterOutline } from "react-icons/io5";
import { supabase } from '../hooks/useChats';

interface Chat {
  id: string;
  name: string;
  created_at: string;
  last_message?: string;
  last_opened_at?: string;
  labels?: string[];
}

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface ChatMember {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface ChatMemberRow {
  chat_id: string;
  users: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
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
  const [showSearch, setShowSearch] = useState(false);
  const [chatMembers, setChatMembers] = useState<Record<string, ChatMember[]>>({});
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Filter chats based on search input
  const filteredChats = chats.filter(chat => {
    const searchLower = userSearch.toLowerCase();
    return (
      chat.name.toLowerCase().includes(searchLower) ||
      (chat.labels && chat.labels.some(label => label.toLowerCase().includes(searchLower)))
    );
  });

  useEffect(() => {
    const fetchChatMembers = async () => {
      const { data, error } = await supabase
        .from('chat_members')
        .select(`
          chat_id,
          users (
            id,
            username,
            avatar_url
          )
        `);

      if (error) {
        console.error('Error fetching chat members:', error);
        return;
      }

      // Organize members by chat
      const membersByChat = (data || []).reduce((acc, row: any) => {
        const chatId = row.chat_id;
        if (!acc[chatId]) {
          acc[chatId] = [];
        }
        if (row.users) {
          acc[chatId].push({
            id: row.users.id,
            username: row.users.username,
            avatar_url: row.users.avatar_url
          });
        }
        return acc;
      }, {} as Record<string, ChatMember[]>);

      setChatMembers(membersByChat);
    };

    fetchChatMembers();
  }, [chats, userId]);

  return (
    <aside className="w-[440px] bg-white border-r border-[#e6e6e6] flex flex-col relative">
      {/* Custom filter row */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e6e6e6] bg-[#f7f8fa] relative">
        <p className=" text-[#04904d] px-1 py-1 rounded font-bold text-[16px] flex items-center gap-1">
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
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#888] p-8">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">No chats yet</p>
              <p className="text-sm">Click on the <span className="text-[#04904d] font-bold">green button</span> below to start a chat.</p>
            </div>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const members = chatMembers[chat.id] || [];
            const isGroup = members.length > 2;

            return (
              <div
                key={chat.id}
                data-chat-id={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-4 border-b border-[#e6e6e6] cursor-pointer hover:bg-[#f7f8fa] ${
                  selectedChat === chat.id ? "bg-[#f7f8fa]" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gray-100">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#222] truncate">{chat.name}</h3>
                          {chat.last_message && (
                            <p className="text-sm text-[#888] truncate">{chat.last_message}</p>
                          )}
                        </div>
                        {chat.labels && chat.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            {chat.labels.map((label, index) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-0.5 bg-[#e6f4ea] text-[#04904d] rounded-full"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-[#888] whitespace-nowrap">
                          {chat.last_opened_at 
                            ? new Date(chat.last_opened_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : `${new Date().getDate().toString().padStart(2, '0')}-${new Date().toLocaleString('en-US', { month: 'short' })}-${new Date().getFullYear()}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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