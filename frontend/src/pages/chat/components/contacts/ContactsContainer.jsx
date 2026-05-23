import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { ChevronDown, ChevronUp, Plus, Search, Users, MessageSquare, UserPlus } from 'lucide-react'
import { useChat } from '../../../../contexts/ChatContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip";
import CreateGroupModal from './CreateGroupModal';
import { cn } from '../../../../lib/utils';

const ContactsContainer = ({ onSelectChat }) => {
  const { chats, chatsLoading, setSelectedChat, selectedChat, onlineUsers, refetchChats } = useChat();
  const { authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState(() => {
    // Initialize search term from localStorage if available
    return localStorage.getItem('contacts_search_term') || '';
  });
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('contacts_active_tab') || 'direct';
  });
  
  // Save active tab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('contacts_active_tab', activeTab);
  }, [activeTab]);
  
  // Save search term to localStorage when it changes
  useEffect(() => {
    if (searchTerm) {
      localStorage.setItem('contacts_search_term', searchTerm);
    } else {
      localStorage.removeItem('contacts_search_term');
    }
  }, [searchTerm]);
  
  // Force refresh chats when component mounts and periodically
  useEffect(() => {
    // Initial fetch
    refetchChats();
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      refetchChats();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [refetchChats]);
  
  // Handle chat selection with callback for mobile view
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    if (onSelectChat) {
      onSelectChat();
    }
  };
  
  // Filter chats based on search term
  const filteredChats = chats?.filter(chat => {
    if (!chat) return false;
    
    // For direct messages, search by the other user's name
    if (!chat.isGroupChat) {
      const otherUser = chat.users.find(u => u._id !== authUser?._id);
      return otherUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // For group chats, search by the chat name
    return chat.chatName?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];
  
  // Separate direct messages and group chats
  const directMessages = filteredChats.filter(chat => !chat.isGroupChat);
  const groupChats = filteredChats.filter(chat => chat.isGroupChat);
  
  // Loading state
  if (chatsLoading) {
    return (
      <div className='relative w-[40vw] lg:w-[30vw] xl:w-[25vw] border-r border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-gray-950 h-full'>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your conversations...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className='relative w-full md:w-[40vw] lg:w-[30vw] xl:w-[25vw] border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-950 h-full'
    >
      {/* Header with search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Tabs for Direct/Group */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Direct</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Groups</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="direct" className="mt-0">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                {directMessages.length > 0 ? (
                  directMessages.map(chat => (
                    <ChatItem 
                      key={chat._id}
                      chat={chat}
                      isDirectMessage={true}
                      isSelected={selectedChat?._id === chat._id}
                      onSelect={() => handleChatSelect(chat)}
                      authUser={authUser}
                      onlineUsers={onlineUsers}
                    />
                  ))
                ) : (
                  <EmptyState 
                    icon={<MessageSquare className="h-12 w-12 text-gray-300" />}
                    title="No direct messages"
                    description="Start a conversation with someone to see it here."
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="groups" className="m-0 p-0">
            <AnimatePresence>
              <motion.div
                key="group-chats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {/* Create Group Button */}
                <motion.div 
                  className="sticky top-0 z-10 p-2 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => setIsCreateGroupModalOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Create New Group</span>
                  </Button>
                </motion.div>
                
                {groupChats.length > 0 ? (
                  groupChats.map(chat => (
                    <ChatItem 
                      key={chat._id}
                      chat={chat}
                      isDirectMessage={false}
                      isSelected={selectedChat?._id === chat._id}
                      onSelect={() => handleChatSelect(chat)}
                      authUser={authUser}
                      onlineUsers={onlineUsers}
                    />
                  ))
                ) : (
                  <EmptyState 
                    icon={<Users className="h-12 w-12 text-gray-300" />}
                    title="No group chats"
                    description="Create a new group to start chatting with multiple people at once."
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateGroupModalOpen && (
          <CreateGroupModal 
            isOpen={isCreateGroupModalOpen}
            onClose={() => setIsCreateGroupModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Chat Item Component
const ChatItem = ({ chat, isDirectMessage, isSelected, onSelect, authUser, onlineUsers }) => {
  const otherUser = isDirectMessage 
    ? chat.users.find(u => u._id !== authUser?._id)
    : null;
  
  const chatName = isDirectMessage 
    ? otherUser?.fullName 
    : chat.chatName;
    
  const lastMessage = chat.latestMessage?.content || "";
  const lastMessageTime = chat.latestMessage?.createdAt 
    ? formatDistanceToNow(new Date(chat.latestMessage.createdAt), { addSuffix: true })
    : "";
  
  const isOnline = isDirectMessage && onlineUsers.includes(otherUser?._id);
  
  return (
    <motion.div 
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center px-4 py-3 gap-3 cursor-pointer transition-colors",
        isSelected ? "bg-gray-100 dark:bg-gray-900" : ""
      )}
      onClick={onSelect}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-800">
          <AvatarImage
            src={isDirectMessage ? otherUser?.profileImg : chat.groupImage}
            alt={chatName?.charAt(0) || "?"}
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {chatName?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        
        {/* Online indicator for direct messages */}
        {isDirectMessage && isOnline && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-950"
          />
        )}
        
        {/* Group indicator */}
        {!isDirectMessage && (
          <div className="absolute -bottom-1 -right-1 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
            <Users className="h-3 w-3 text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-center w-full">
          <span className="font-medium truncate text-gray-900 dark:text-gray-100">{chatName}</span>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-1">
              {lastMessageTime}
            </span>
          )}
        </div>
        
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {lastMessage || (isDirectMessage ? "Start a conversation" : "No messages yet")}
        </span>
      </div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
    </div>
  );
};

export default ContactsContainer;
