"use client";
import { FaUserCircle, FaSearch, FaFilter, FaSave, FaPlus, FaCheckCircle, FaPhone, FaEllipsisV, FaSmile, FaPaperclip, FaMicrophone, FaRegPaperPlane, FaBars, FaCog, FaBell, FaQuestionCircle, FaUsers, FaLayerGroup, FaChartBar, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from '@supabase/supabase-js';
import { saveChats, getChats, saveMessages, getMessagesByChat, deleteChat as deleteChatFromIndexedDB } from './indexeddb';
import ChatList from './components/ChatList';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import LeftIconBar from './components/LeftIconBar';
import RightIconBar from './components/RightIconBar';
import TopBar from './components/TopBar';
import AddChatModal from './components/AddChatModal';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function useChats(userId: string) {
  const [chats, setChats] = useState<any[]>([]);
  
  // Expose a refresh function
  const refreshChats = async () => {
    if (typeof window === 'undefined') return;
    
    console.log('Refreshing chats...');
    const { data, error } = await supabase
      .from("chat_members")
      .select(`
        chat_id,
        chats (
          name,
          last_opened_at,
          chat_labels (
            labels (
              name
            )
          )
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    console.log('Fetched chat members:', data);

    // Get current IndexedDB chats
    const cachedChats = await getChats();
    console.log('Current IndexedDB chats:', cachedChats);

    // Build a map of cached chats for quick lookup
    const cachedMap = new Map(cachedChats.map((c: any) => [c.id, c]));

    // Build chat list from Supabase, merging with cache for missing names and extracting labels
    const supabaseChats = (data || []).map((row: any) => {
      const chat = row.chats;
      const labels = (chat?.chat_labels || [])
        .map((cl: any) => cl.labels?.name)
        .filter(Boolean);
      const cached = cachedMap.get(String(row.chat_id));
      return {
        id: String(row.chat_id),
        name: chat?.name || cached?.name || "Unnamed Chat",
        last_opened_at: chat?.last_opened_at,
        labels,
      };
    });

    // Get all chat IDs from Supabase
    const supabaseIds = new Set(supabaseChats.map((c: any) => c.id));
    
    // Delete any cached chats that are no longer in Supabase
    for (const cachedChat of cachedChats) {
      if (!supabaseIds.has(cachedChat.id)) {
        console.log('Deleting chat from IndexedDB:', cachedChat.id);
        await deleteChatFromIndexedDB(cachedChat.id);
      }
    }

    // Only keep chats that exist in Supabase
    const mergedChats = supabaseChats;

    console.log('Setting chats to:', mergedChats);
    setChats(mergedChats);
    await saveChats(mergedChats);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load from IndexedDB first
    getChats().then(localChats => {
      if (localChats.length > 0) {
        setChats(localChats);
        console.log('Loaded chats from IndexedDB:', localChats);
      }
    });
    refreshChats();

    // Real-time subscription for chat_members
    const channel = supabase
      .channel('chat_members-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_members' },
        async (payload) => {
          console.log('Chat members change:', payload);
          await refreshChats();
        }
      )
      .subscribe();

    // Real-time subscription for chats
    const chatsChannel = supabase
      .channel('chats-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chats' },
        async (payload) => {
          console.log('Chats change:', payload);
          await refreshChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(chatsChannel);
    };
  }, [userId]);

  return { chats, refreshChats };
}

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load from IndexedDB first
    getMessagesByChat(chatId).then(localMsgs => {
      if (localMsgs.length > 0) {
        setMessages(localMsgs);
        console.log('Loaded messages from IndexedDB:', localMsgs);
      }
    });
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      saveMessages(data || []);
      console.log('Supabase messages fetched and saved to IndexedDB:', data);
    };
    fetchMessages();

    // Global real-time subscription for all messages
    const channel = supabase
      .channel('messages-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log("Payload received", payload);
          console.log("Current chatId", chatId, "Payload chat_id", payload.new.chat_id);
          if (String(payload.new.chat_id) === String(chatId)) {
            fetchMessages();
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscribed to channel', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return { messages, chatAreaRef };
}

export async function sendMessage(chatId: string, senderId: string, content: string, attachment_url = '', attachment_type = '') {
  console.log('Attempting to send message:', { chatId, senderId, content, attachment_url, attachment_type });
  const { data, error } = await supabase.from("messages").insert([
    { chat_id: chatId, sender_id: senderId, content, attachment_url, attachment_type }
  ]);
  if (error) {
    console.error('Error sending message:', error);
  } else {
    console.log('Message sent successfully:', data);
  }
}

export default function ChatsPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [addChatType, setAddChatType] = useState<'direct' | 'group'>('direct');
  const [groupName, setGroupName] = useState("");
  const [addChatUserSearch, setAddChatUserSearch] = useState("");
  const [addChatUserResults, setAddChatUserResults] = useState<any[]>([]);
  const [selectedAddChatUsers, setSelectedAddChatUsers] = useState<any[]>([]);
  const [chatMembers, setChatMembers] = useState<Record<string, Array<{ id: string; username: string }>>>({});
  const [headerSearchResults, setHeaderSearchResults] = useState<any[]>([]);
  const [headerSearching, setHeaderSearching] = useState(false);
  const [directName, setDirectName] = useState("");
  const [label, setLabel] = useState("");
  const userId = typeof window !== "undefined" ? String(localStorage.getItem("userId")) : null;
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const { chats, refreshChats } = useChats(userId || "");
  const chatListRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedChat) {
      setMessagesLoading(true);
      console.log('Setting up message subscription for chat:', selectedChat);
      // Load from IndexedDB first
      getMessagesByChat(selectedChat).then(localMsgs => {
        console.log('Loaded messages from IndexedDB:', localMsgs);
        setMessages(localMsgs);
        setMessagesLoading(false);
      });
      const fetchMessages = async () => {
        console.log('Fetching messages from Supabase for chat:', selectedChat);
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", selectedChat)
          .order("created_at", { ascending: true });
        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          console.log('Fetched messages from Supabase:', data);
          setMessages(data || []);
          saveMessages(data || []);
        }
        setMessagesLoading(false);
      };
      fetchMessages();

      // Global real-time subscription for all messages
      const channel = supabase
        .channel('messages-global')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            console.log("Real-time message received:", payload);
            console.log("Current chatId:", selectedChat, "Payload chat_id:", payload.new.chat_id);
            if (String(payload.new.chat_id) === String(selectedChat)) {
              console.log('Fetching messages after real-time update');
              fetchMessages();
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        console.log('Cleaning up message subscription for chat:', selectedChat);
        supabase.removeChannel(channel);
      };
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0].id);
    }
  }, [chats, selectedChat]);

  // Scroll to selected chat in sidebar
  useEffect(() => {
    if (!selectedChat || !chatListRef.current) return;
    const chatDiv = chatListRef.current.querySelector(
      `[data-chat-id="${selectedChat}"]`
    );
    if (chatDiv && chatDiv.scrollIntoView) {
      chatDiv.scrollIntoView({ block: "nearest" });
    }
  }, [selectedChat, chats]);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("loggedIn")) {
      router.replace("/login");
    }
  }, [router]);

  // Fetch chat members when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      const fetchChatMembers = async () => {
        const { data, error } = await supabase
          .from("chat_members")
          .select("user_id, users(username)")
          .eq("chat_id", selectedChat);
        
        if (!error && data) {
          const members = data.map((row: any) => ({
            id: row.user_id,
            username: row.users?.username || 'Unknown User'
          }));
          setChatMembers(prev => ({
            ...prev,
            [selectedChat]: members
          }));
        }
      };
      fetchChatMembers();
    }
  }, [selectedChat]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !selectedChat || !userId) {
      console.log('Cannot send message:', { message: message.trim(), selectedChat, userId });
      return;
    }
    console.log('Sending message:', { message: message.trim(), selectedChat, userId });
    await sendMessage(selectedChat, userId, message.trim());
    setMessage("");
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.clear();
      router.replace("/login");
    }
  }

  async function handleUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setUserSearch(value);
    if (value.length < 2) {
      setUserResults([]);
      return;
    }
    setSearching(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", `%${value}%`)
      .neq("id", userId);
    setUserResults(data || []);
    setSearching(false);
  }

  async function startChatWithUser(otherUserId: string) {
    console.log(userId, otherUserId);
    if (!userId || !otherUserId) return;
    setStartingChat(true);
    // Check if a chat already exists between the two users
    const { data: existingChats } = await supabase
      .from("chat_members")
      .select("chat_id")
      .eq("user_id", userId);

    const chatIds = (existingChats || []).map((row: any) => String(row.chat_id));

    // Find a chat with exactly these two members
    let foundChatId: string | null = null;
    for (const chatId of chatIds) {
      const { data: members } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", chatId);
      const memberIds = (members || []).map((m: any) => String(m.user_id));
      if (
        memberIds.length === 2 &&
        memberIds.includes(userId) &&
        memberIds.includes(otherUserId)
      ) {
        foundChatId = chatId;
        break;
      }
    }

    if (foundChatId) {
      setSelectedChat(foundChatId);
      setUserSearch("");
      setUserResults([]);
      setStartingChat(false);
      return;
    }

    // Create a new chat with the directName
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert([{ name: directName }])
      .select("id")
      .single();

    console.log(newChat, "newChat");  

    if (!newChat) {
      setStartingChat(false);
      return;
    }

    // Add label if provided
    let labelId = null;
    if (label && label.trim() !== "") {
      const { data: labelData, error: labelError } = await supabase
        .from("labels")
        .upsert([{ name: label.trim() }])
        .select("id")
        .single();
      if (!labelError && labelData) {
        labelId = labelData.id;
      }
    }
    if (labelId) {
      await supabase.from("chat_labels").insert([
        { chat_id: newChat.id, label_id: labelId }
      ]);
    }

    // Add both users to chat_members
    const { error: memberError } = await supabase.from("chat_members").insert([
      { chat_id: newChat.id, user_id: userId },
      { chat_id: newChat.id, user_id: otherUserId },
    ]);

    if (memberError) {
      setStartingChat(false);
      return;
    }

    // Optimistically add the new chat to the UI and select it
    setSelectedChat(newChat.id);
    setUserSearch("");
    setUserResults([]);
    setStartingChat(false);
    setDirectName(""); // Clear directName after creation
    setLabel(""); // Clear label after creation
    // Refresh chats in the background
    refreshChats();
  }

  async function handleAddChatUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setAddChatUserSearch(value);
    if (value.length < 2) {
      setAddChatUserResults([]);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", `%${value}%`)
      .neq("id", userId);
    setAddChatUserResults(data || []);
  }

  function handleSelectAddChatUser(user: any) {
    if (selectedAddChatUsers.some(u => u.id === user.id)) {
      setSelectedAddChatUsers(selectedAddChatUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedAddChatUsers([...selectedAddChatUsers, user]);
    }
  }

  function handleRemoveAddChatUser(userId: string) {
    setSelectedAddChatUsers(selectedAddChatUsers.filter(u => u.id !== userId));
  }

  async function handleCreateAddChat() {
    if (addChatType === 'group') {
      if (selectedAddChatUsers.length < 2 || !groupName) {
        console.log('Cannot create group chat:', { selectedUsers: selectedAddChatUsers.length, groupName });
        return;
      }
      console.log('Creating group chat:', { groupName, selectedUsers: selectedAddChatUsers });
      
      // Create a new group chat
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert([{ name: groupName }])
        .select("id")
        .single();

      if (chatError || !newChat) {
        console.error("Error creating chat:", chatError);
        alert("Failed to create group chat.");
        return;
      }

      console.log('Created new chat:', newChat);

      // Add label if provided
      let labelId = null;
      if (label && label.trim() !== "") {
        const { data: labelData, error: labelError } = await supabase
          .from("labels")
          .upsert([{ name: label.trim() }])
          .select("id")
          .single();
        if (!labelError && labelData) {
          labelId = labelData.id;
        }
      }
      if (labelId) {
        await supabase.from("chat_labels").insert([
          { chat_id: newChat.id, label_id: labelId }
        ]);
      }

      // Add all selected users and current user to chat_members
      const memberIds = [userId, ...selectedAddChatUsers.map(u => u.id)];
      const { error: memberError } = await supabase.from("chat_members").insert(
        memberIds.map(uid => ({ chat_id: newChat.id, user_id: uid }))
      );

      if (memberError) {
        console.error("Error adding members:", memberError);
        alert("Failed to add members to group chat.");
        return;
      }

      console.log('Added members to chat:', memberIds);

      // Update UI
      setSelectedChat(newChat.id);
      setShowAddChatModal(false);
      setAddChatUserSearch("");
      setAddChatUserResults([]);
      setSelectedAddChatUsers([]);
      setGroupName("");
      setLabel(""); // Clear label after creation
      refreshChats();
    } else if (selectedAddChatUsers.length === 1) {
      await startChatWithUser(selectedAddChatUsers[0].id);
      setShowAddChatModal(false);
      setAddChatUserSearch("");
      setAddChatUserResults([]);
      setSelectedAddChatUsers([]);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedChat || !userId) return;

    // Upload to Supabase Storage
    const filePath = `${selectedChat}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(filePath, file);

    if (error) {
      alert('Failed to upload file');
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(filePath);

    // Send as a message
    await sendMessage(selectedChat, userId, '', publicUrlData.publicUrl, file.type);

    // Optionally, clear the file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleHeaderUserSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value.length < 2) {
      setHeaderSearchResults([]);
      return;
    }
    setHeaderSearching(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", `%${value}%`)
      .neq("id", userId);
    setHeaderSearchResults(data || []);
    setHeaderSearching(false);
  }

  async function handleAddUserToChat(user: { id: string; username: string }) {
    if (!selectedChat || !userId) return;

    // Add user to chat_members
    const { error } = await supabase
      .from("chat_members")
      .insert([{ chat_id: selectedChat, user_id: user.id }]);

    if (error) {
      console.error("Error adding user to chat:", error);
      return;
    }

    // Update local state
    setChatMembers(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), user]
    }));

    // Refresh chats to update member count
    refreshChats();
  }

  async function handleDeleteChat() {
    if (!selectedChat) return;
    
    console.log('Deleting chat:', selectedChat);
    
    // Delete from Supabase
    const { error } = await supabase.from("chats").delete().eq("id", selectedChat);
    if (error) {
      console.error('Error deleting chat:', error);
      alert("Failed to delete chat.");
      return;
    }

    // Delete from current user's IndexedDB
    await deleteChatFromIndexedDB(selectedChat);
    console.log('Deleted from IndexedDB');
    
    // Force refresh chats
    await refreshChats();
    setSelectedChat(null);
  }

  return (
    <div className="relative h-screen w-screen bg-[#f7f8fa] font-sans overflow-hidden">
      <TopBar
        username={username}
        showLogout={showLogout}
        onToggleLogout={() => setShowLogout(v => !v)}
        onLogout={handleLogout}
      />
      
      <LeftIconBar />
      <RightIconBar />

      {/* Main content area */}
      <div className="absolute top-[56px] left-[56px] right-[56px] bottom-0 flex">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onUserSearch={handleUserSearch}
          userSearch={userSearch}
          userResults={userResults}
          searching={searching}
          onStartChat={startChatWithUser}
          onShowAddChat={() => setShowAddChatModal(true)}
        />
        
        {/* Main chat area */}
        <main className="flex-1 flex flex-col">
          {selectedChat && chats.find(c => c.id === selectedChat) && (
            <ChatHeader
              chatName={chats.find(c => c.id === selectedChat)?.name}
              userCount={chatMembers[selectedChat]?.length || 0}
              members={chatMembers[selectedChat] || []}
              onSearchUser={handleHeaderUserSearch}
              searchResults={headerSearchResults}
              onSelectUser={handleAddUserToChat}
              onDeleteChat={handleDeleteChat}
            />
          )}
          
          <MessageList
            messages={messages}
            currentUserId={userId || ''}
            isLoading={messagesLoading}
          />

          <MessageInput
            message={message}
            onMessageChange={e => setMessage(e.target.value)}
            onSend={handleSend}
            onFileChange={handleFileChange}
          />
        </main>
      </div>

      {showAddChatModal && (
        <AddChatModal
          addChatType={addChatType}
          setAddChatType={setAddChatType}
          groupName={groupName}
          setGroupName={setGroupName}
          directName={directName}
          setDirectName={setDirectName}
          label={label}
          setLabel={setLabel}
          addChatUserSearch={addChatUserSearch}
          setAddChatUserSearch={setAddChatUserSearch}
          addChatUserResults={addChatUserResults}
          selectedAddChatUsers={selectedAddChatUsers}
          onSelectAddChatUser={handleSelectAddChatUser}
          onRemoveAddChatUser={handleRemoveAddChatUser}
          onCreateAddChat={handleCreateAddChat}
          onClose={() => setShowAddChatModal(false)}
          onUserSearch={handleAddChatUserSearch}
        />
      )}
    </div>
  );
}