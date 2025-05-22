import { useRef, useEffect, useState } from 'react';
import { FaUserCircle, FaUsers } from "react-icons/fa";
import { supabase } from '../hooks/useChats';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
  chat_id: string;
}

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Chat {
  id: string;
  is_group: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
  currentChat: Chat | null;
}

export default function MessageList({ messages, currentUserId, isLoading, currentChat }: MessageListProps) {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [chatMembers, setChatMembers] = useState<User[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);

  // Fetch user details for all unique sender IDs and chat members
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentChat) return;

      // Fetch chat members
      const { data: members, error: membersError } = await supabase
        .from('chat_members')
        .select(`
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq('chat_id', currentChat.id);

      if (membersError) {
        console.error('Error fetching chat members:', membersError);
        return;
      }

      // Extract users from chat members
      const chatUsers = members.map((member: any) => member.users);
      setChatMembers(chatUsers);

      // For direct chats, find the other user
      if (!currentChat.is_group && chatUsers.length === 2) {
        const otherUser = chatUsers.find(user => user.id !== currentUserId);
        if (otherUser) {
          setOtherUser(otherUser);
        }
      }

      // Fetch message senders
      const uniqueSenderIds = [...new Set(messages.map(msg => msg.sender_id))];
      const { data: senders, error: sendersError } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .in('id', uniqueSenderIds);

      if (sendersError) {
        console.error('Error fetching senders:', sendersError);
        return;
      }

      const userMap = senders.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);

      setUsers(userMap);
    };

    if (messages.length > 0 && currentChat) {
      fetchUsers();
    }
  }, [messages, currentChat, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#888]">
        <div>Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#888]">
        <div>No messages yet</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 bg-[url('/chat-bg.png')] bg-repeat" ref={chatAreaRef}>
      <div className="flex flex-col gap-4 w-full">
        {messages.map((msg) => {
          const user = users[msg.sender_id];
          // Convert both IDs to strings and trim any whitespace
          const senderId = String(msg.sender_id).trim();
          const currentId = String(currentUserId).trim();
          const isCurrentUser = senderId === currentId;
          const displayName = isCurrentUser ? 'You' : (user?.username || 'Unknown User');

          console.log('Message Debug:', {
            senderId,
            currentId,
            isCurrentUser,
            displayName,
            rawSenderId: msg.sender_id,
            rawCurrentId: currentUserId,
            typeOfSenderId: typeof msg.sender_id,
            typeOfCurrentId: typeof currentUserId
          });

          return (
            <div key={msg.id} className={`w-full flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[70%]`}>
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                  {currentChat?.is_group ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FaUsers size={24} className="text-[#25d366]" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FaUserCircle size={32} className="text-[#25d366]" />
                    </div>
                  )}
                </div>
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={
                      isCurrentUser
                        ? "bg-[#e7f9ef] rounded-lg px-4 py-2 shadow text-[#222] text-sm"
                        : "bg-white rounded-lg px-4 py-2 shadow text-[#222] text-sm"
                    }
                  >
                    {!isCurrentUser && (
                      <div className="text-xs font-medium text-[#25d366] mb-1">{displayName}</div>
                    )}
                    {msg.attachment_url ? (
                      msg.attachment_type?.startsWith('image/') ? (
                        <img src={msg.attachment_url} alt="attachment" className="max-w-xs max-h-60 rounded" />
                      ) : msg.attachment_type?.startsWith('video/') ? (
                        <video controls className="max-w-xs max-h-60 rounded">
                          <source src={msg.attachment_url} type={msg.attachment_type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                          Download attachment
                        </a>
                      )
                    ) : (
                      msg.content
                    )}
                    <div className={`text-xs text-[#888] mt-1${isCurrentUser ? " text-right" : ""}`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 