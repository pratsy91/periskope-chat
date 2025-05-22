import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { saveChats, getChats, deleteChat as deleteChatFromIndexedDB } from '../indexeddb';

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