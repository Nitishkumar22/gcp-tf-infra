import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ChatHeader from "./components/ChatHeader";
import MessageBar from "./components/MessageBar";
import MessageContainer from "./components/MessageContainer";
import ChatDetailsPanel from "../details/ChatDetailsPanel";
import { useChat } from "../../../../contexts/ChatContext";
import { useQuery } from "@tanstack/react-query";
import { Info, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";

const ChatContainer = ({ onBackClick, isMobileView }) => {
  const { selectedChat, joinChatRoom } = useChat();
  const [isMobile, setIsMobile] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  
  // Fetch messages for the selected chat
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", selectedChat?._id],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/message/${selectedChat._id}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json",
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Fetch messages error:", error);
        return [];
      }
    },
    enabled: !!selectedChat,
    refetchInterval: 10000, // Refetch every 10 seconds as a fallback
  });
  
  // Join the chat room for socket.io
  useEffect(() => {
    if (selectedChat?._id) {
      joinChatRoom(selectedChat._id);
    }
  }, [selectedChat, joinChatRoom]);
  
  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);
  
  // Toggle details panel
  const toggleDetailsPanel = () => {
    setIsDetailsPanelOpen(prev => !prev);
  };

  // Close details panel (for mobile)
  const closeDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
  };

  return (
    <div className="flex h-full w-full md:static overflow-hidden">
      <div className={`flex flex-col h-full justify-between ${isMobile && isDetailsPanelOpen ? 'hidden' : 'flex-1'} min-w-0`}>
        <ChatHeader 
          onInfoClick={toggleDetailsPanel} 
          isDetailsPanelOpen={isDetailsPanelOpen} 
          onBackClick={onBackClick}
          isMobileView={isMobileView}
        />
        <MessageContainer messages={messages} isLoading={isLoading} />
        <MessageBar chatId={selectedChat?._id} />
      </div>
      
      <AnimatePresence>
        {isDetailsPanelOpen && (
          <div className={`${isMobile ? 'absolute inset-0 z-50' : 'w-[280px] lg:w-[320px] flex-shrink-0'}`}>
            <ChatDetailsPanel onClose={closeDetailsPanel} isMobile={isMobile} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatContainer;
