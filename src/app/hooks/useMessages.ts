import { useState, useEffect, useRef } from 'react';
import { supabase } from './useChats';
import { saveMessages, getMessagesByChat } from '../indexeddb';

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