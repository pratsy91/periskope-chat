import { FaUserCircle, FaBellSlash, FaQuestionCircle, FaCog, FaDownload, FaMagic, FaList, FaChevronDown, FaSyncAlt } from "react-icons/fa";
import { SiGooglemessages } from "react-icons/si";
import { AiFillMessage } from "react-icons/ai";
import { LuRefreshCcwDot } from "react-icons/lu";
import { GoDesktopDownload } from "react-icons/go";
import { BsStars } from "react-icons/bs";
import { useRef, useEffect } from "react";

interface TopBarProps {
  username: string | null;
  showLogout: boolean;
  onToggleLogout: () => void;
  onLogout: () => void;
}

export default function TopBar({ username, showLogout, onToggleLogout, onLogout }: TopBarProps) {
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLogout) return;
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        onToggleLogout();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogout, onToggleLogout]);

  return (
    <header className="absolute top-0 left-0 w-full h-[56px] bg-white 
    border-b border-[#e6e6e6] flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-5">
        <span className="text-[#04904d] text-3xl"><SiGooglemessages /></span>
        <div className="flex items-center gap-2">
        <span className="text-[#7f8693]"><AiFillMessage size={16} /></span>
        <span className="font-bold text-lg text-[#7f8693]">chats</span>
        </div>
      </div>
      <div className="flex items-center gap-3 relative">
        <div className="flex items-center gap-1 bg-white border border-[#e6e6e6] 
        px-2 py-1 rounded cursor-pointer hover:bg-[#f7f8fa] text-[#384555]">
          <LuRefreshCcwDot size={18} />
          <span className="text-sm font-medium">Refresh</span>
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#e6e6e6]
         px-2 py-1 rounded cursor-pointer hover:bg-[#f7f8fa] text-[#384555]">
          <FaQuestionCircle size={18} />
          <span className="text-sm font-medium">Help</span>
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#e6e6e6]
         px-2 py-1 rounded cursor-pointer text-[#384555]">
          <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>
          <span className="text-sm font-medium">5 / 6 phones</span>
          <FaChevronDown size={14} />
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#e6e6e6]
         px-2 py-1 rounded cursor-pointer hover:bg-[#f7f8fa] text-[#384555]">
          <GoDesktopDownload size={18} />
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#e6e6e6] 
        px-2 py-1 rounded cursor-pointer hover:bg-[#f7f8fa] text-[#384555]">
          <FaBellSlash size={18} />
        </div>
        <div className="flex items-center gap-1 bg-white border border-[#e6e6e6]
         px-2 py-1 rounded cursor-pointer hover:bg-[#f7f8fa] text-[#384555]">
          <BsStars size={18} className="text-[#efbf00]"/>
          <FaList size={18} />
        </div>
        <div ref={avatarRef} style={{ display: "inline-block", position: "relative" }} className="mb-6">
          <span className="text-[#888] cursor-pointer ml-2 " onClick={onToggleLogout}>
            <FaUserCircle size={28} />
          </span>
          {showLogout && (
            <div className="absolute right-0 top-14 bg-white border border-[#e6e6e6] rounded shadow p-2 z-30 min-w-[120px] flex flex-col items-end">
              <div className="text-xs text-[#888] mb-2 px-2">{username}</div>
              <button
                onClick={onLogout}
                className="text-red-500 hover:bg-[#f7f8fa] px-3 py-1 rounded text-sm w-full text-right"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 