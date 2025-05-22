import {  FaUsers } from "react-icons/fa";
import { LuPanelLeftClose } from "react-icons/lu";
import { SlRefresh } from "react-icons/sl";
import { LuPenLine } from "react-icons/lu";
import { FaBarsStaggered, FaHubspot } from "react-icons/fa6";
import { RiListCheck2, RiFolderImageFill, RiListSettingsLine } from "react-icons/ri";
import { IoAtSharp } from "react-icons/io5";
export default function RightIconBar() {
  return (
    <nav className="absolute top-[56px] right-0 h-[calc(100%-56px)] w-[56px] bg-white border-l border-[#e6e6e6] flex flex-col items-center py-4 gap-4 z-10">
      <span className="rounded-md p-1 text-[#aeb5bf]"><LuPanelLeftClose size={22} /></span>
      <span className="text-[#aeb5bf]"><SlRefresh size={22} /></span>
      <span className="text-[#aeb5bf]"><LuPenLine size={22} /></span>
      <span className="text-[#aeb5bf]"><FaBarsStaggered size={22} /></span>
      <span className="text-[#aeb5bf]"><RiListCheck2 size={22} /></span>
      <span className="text-[#aeb5bf]"><FaHubspot size={22} /></span>
      <span className="text-[#aeb5bf]"><FaUsers size={20} /></span>
      <span className="text-[#aeb5bf]"><IoAtSharp size={22} /></span>
      <span className="text-[#aeb5bf]"><RiFolderImageFill size={22} /></span>
      <span className="text-[#aeb5bf]"><RiListSettingsLine size={22} /></span>
    </nav>
  );
} 