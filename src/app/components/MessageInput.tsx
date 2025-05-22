import { useRef } from 'react';
import { FaSmile, FaPaperclip, FaMicrophone, FaRegPaperPlane, FaClock, FaSyncAlt, FaMagic, FaList } from "react-icons/fa";
import { CiFaceSmile } from "react-icons/ci";
import { CiClock2 } from "react-icons/ci";
import { PiClockClockwiseLight } from "react-icons/pi";
interface MessageInputProps {
  message: string;
  onMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MessageInput({
  message,
  onMessageChange,
  onSend,
  onFileChange,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form className="flex flex-col gap-2 px-8 py-4 border-t border-[#e6e6e6] bg-white" onSubmit={onSend}>
      <div className="flex items-center w-full">
        <input
          type="text"
          placeholder="Message..."
          value={message}
          onChange={onMessageChange}
          className="flex-1 border-none outline-none bg-transparent text-[#222] text-base placeholder:text-[#b0b0b0]"
        />
        <button type="submit" className="ml-2 bg-transparent p-2 rounded-full flex items-center justify-center hover:bg-[#e6f4ea] transition-colors">
          <FaRegPaperPlane size={28} className="text-[#25d366]" />
        </button>
      </div>
      <div className="flex items-center gap-4 mt-1">
        <input
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={onFileChange}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#222] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FaPaperclip size={20} />
        </button>
        <button type="button" className="text-[#5d6873] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <CiFaceSmile size={20} />
        </button>
        <button type="button" className="text-[#5d6873] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <CiClock2 size={20} />
        </button>
        <button type="button" className="text-[#5d6873] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <PiClockClockwiseLight size={20} />
        </button>
        <button type="button" className="text-[#222] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FaMagic size={20} />
        </button>
        <button type="button" className="text-[#243445] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FaList size={20} />
        </button>
        <button type="button" className="text-[#243445] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FaMicrophone size={20} />
        </button>
      </div>
    </form>
  );
} 