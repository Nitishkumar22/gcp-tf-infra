import { useState } from "react";
import { X, MoreVertical, Users, Phone, Video, Info, ChevronLeft } from "lucide-react";
import { useChat } from "../../../../../contexts/ChatContext";
import { useAuth } from "../../../../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../../../../components/ui/dropdown-menu";
import GroupInfoModal from "./GroupInfoModal";

const ChatHeader = ({ onInfoClick, isDetailsPanelOpen, onBackClick, isMobileView }) => {
  const { selectedChat, setSelectedChat, onlineUsers } = useChat();
  const { authUser } = useAuth();
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  
  if (!selectedChat) return null;
  
  const otherUser = !selectedChat.isGroupChat 
    ? selectedChat.users.find(u => u._id !== authUser?._id)
    : null;
    
  const chatName = selectedChat.isGroupChat ? selectedChat.chatName : otherUser?.fullName;
  const chatImage = selectedChat.isGroupChat ? selectedChat.groupImage : otherUser?.profileImg;
  const isOnline = !selectedChat.isGroupChat && onlineUsers.includes(otherUser?._id);
  
  return (
    <div className='h-[8vh] border-b-2 border-[#bdbaba] flex items-center justify-between px-4 md:px-6'>
      <div className='flex gap-3 items-center'>
        {isMobileView && (
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none mr-1"
            onClick={onBackClick}
            aria-label="Back to contacts"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={chatImage} alt={chatName} />
          <AvatarFallback>{chatName?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <span className="font-medium truncate max-w-[150px] md:max-w-[200px]">{chatName}</span>
          {selectedChat.isGroupChat ? (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {selectedChat.users.length} members
            </span>
          ) : (
            <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      </div>
      
      <div className='flex items-center gap-3'>
        <button 
          className={`text-gray-500 hover:text-gray-700 focus:outline-none ${isDetailsPanelOpen ? 'text-primary' : ''}`}
          onClick={onInfoClick}
          aria-label="Toggle details panel"
        >
          <Info className="h-5 w-5" />
        </button>
        
        {!selectedChat.isGroupChat && (
          <>
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Phone className="h-5 w-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <Video className="h-5 w-5" />
            </button>
          </>
        )}
        
        {selectedChat.isGroupChat && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsGroupInfoOpen(true)}>
                Group Info
              </DropdownMenuItem>
              {/* Add more options as needed */}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <button 
          className='text-neutral-900 focus:border-none focus:outline-none focus:text-black duration-300 transition-all'
          onClick={() => setSelectedChat(null)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {isGroupInfoOpen && (
        <GroupInfoModal 
          isOpen={isGroupInfoOpen}
          onClose={() => setIsGroupInfoOpen(false)}
          chat={selectedChat}
        />
      )}
    </div>
  );
};

export default ChatHeader;