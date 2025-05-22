import { GrTask } from "react-icons/gr";
import { IoIosSettings } from "react-icons/io";
import { IoTicket, IoList } from "react-icons/io5";
import { AiFillMessage, AiFillHome } from "react-icons/ai";
import { HiMegaphone } from "react-icons/hi2";
import { PiGitFork } from "react-icons/pi";
import { RiFolderImageFill, RiContactsBookFill, RiLineChartLine } from "react-icons/ri";

export default function LeftIconBar() {
  return (
    <nav className="absolute top-[56px] left-0 h-[calc(100%-56px)] w-[56px] bg-white border-r border-[#e6e6e6] flex flex-col items-center py-4 gap-4 z-10">
     <span className="text-[#384555]"><AiFillHome size={22} /></span>
      <span className="text-[#04904d] mb-2"><AiFillMessage size={22} /></span>
      <span className="text-[#384555]"><IoTicket size={22} /></span>
      <span className="text-[#384555]"><RiLineChartLine size={22} /></span>
      <div className="h-[1px] bg-[#d2d4d6] w-[40px]"></div>
      <span className="text-[#384555]"><IoList size={22} /></span>
      <span className="text-[#384555]"><HiMegaphone size={22} /></span>
      <span className="text-[#384555] rotate-180"><PiGitFork size={22} /></span>
      <div className="h-[1px] bg-[#d2d4d6] w-[40px]"></div>
      <span className="text-[#384555]"><RiContactsBookFill size={22} /></span>
      <span className="text-[#384555]"><RiFolderImageFill size={22} /></span>
      <div className="h-[1px] bg-[#d2d4d6] w-[40px]"></div>
      <span className="text-[#384555]"><GrTask size={22} /></span>
      <span className="text-[#384555]"><IoIosSettings size={22} /></span>
    </nav>
  );
} 