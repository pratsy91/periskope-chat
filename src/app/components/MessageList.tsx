import { useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
}

export default function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const chatAreaRef = useRef<HTMLDivElement>(null);

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
      <div className="flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.sender_id === currentUserId
                ? "self-end max-w-[60%]"
                : "self-start max-w-[60%]"
            }
          >
            <div
              className={
                msg.sender_id === currentUserId
                  ? "bg-[#e7f9ef] rounded-lg px-4 py-2 shadow text-[#222] text-sm"
                  : "bg-white rounded-lg px-4 py-2 shadow text-[#222] text-sm"
              }
            >
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
              <div className={`text-xs text-[#888] mt-1${msg.sender_id === currentUserId ? " text-right" : ""}`}>
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 