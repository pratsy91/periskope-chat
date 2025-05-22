import { supabase } from '../hooks/useChats';

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