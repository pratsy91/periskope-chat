import { useRef } from 'react';
import { FaSmile, FaPaperclip, FaMicrophone, FaRegPaperPlane, FaClock, FaSyncAlt, FaMagic, FaList } from "react-icons/fa";
import { FiSmile, FiClock } from "react-icons/fi";
import { BsStars } from "react-icons/bs";
import { MdAttachFile } from "react-icons/md";
import { PiClockClockwiseBold } from "react-icons/pi";
import { RiFileList2Fill } from "react-icons/ri";
import { IoSendSharp } from "react-icons/io5";
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
          <IoSendSharp size={28} className="text-[#04904d]" />
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
        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[#5d6873] hover:bg-[#f7f8fa] rotate-45 p-2 rounded-full flex items-center justify-center">
          <MdAttachFile size={20} />
        </button>
        <button type="button" className="text-[#5d6873] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FiSmile size={20} />
        </button>
        <button type="button" className="text-[#5d6873] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FiClock size={20} />
        </button>
        <button type="button" className="text-[#5d6873] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <PiClockClockwiseBold size={20} />
        </button>
        <button type="button" className="text-[#222] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <BsStars size={20} />
        </button>
        <button type="button" className="text-[#243445] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <RiFileList2Fill size={20} />
        </button>
        <button type="button" className="text-[#243445] hover:bg-[#f7f8fa] p-2 rounded-full flex items-center justify-center">
          <FaMicrophone size={20} />
        </button>
      </div>
    </form>
  );
} 