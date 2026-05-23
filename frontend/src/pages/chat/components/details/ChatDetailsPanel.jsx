import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { 
  User, Mail, Users, FileIcon, Image, Paperclip, 
  Trash2, Settings, X, ChevronRight, LogOut 
} from 'lucide-react';
import { Button } from "../../../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { useChat } from '../../../../contexts/ChatContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { Separator } from '../../../../components/ui/separator';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "../../../../components/ui/dialog";

const ChatDetailsPanel = ({ onClose, isMobile }) => {
  const { selectedChat, setSelectedChat, leaveChat } = useChat();
  const { authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  if (!selectedChat) return null;
  
  const isDirectMessage = !selectedChat.isGroupChat;
  const otherUser = isDirectMessage 
    ? selectedChat.users.find(u => u._id !== authUser?._id)
    : null;
  
  const handleLeaveChat = async () => {
    await leaveChat(selectedChat._id);
    setSelectedChat(null);
    setIsDeleteDialogOpen(false);
  };
  
  const renderProfileTab = () => {
    if (isDirectMessage) {
      return (
        <div className="space-y-4 p-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border border-gray-200 dark:border-gray-800">
              <AvatarImage src={otherUser?.profileImg} alt={otherUser?.fullName} />
              <AvatarFallback className="text-xl">{otherUser?.fullName?.charAt(0) || "?"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{otherUser?.fullName}</h2>
            <p className="text-sm text-gray-500">@{otherUser?.username}</p>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-500">{otherUser?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Followers</p>
                <p className="text-sm text-gray-500">{otherUser?.followers?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Following</p>
                <p className="text-sm text-gray-500">{otherUser?.following?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-center">
            <Button variant="outline" className="w-full">
              {otherUser?.followers?.includes(authUser?._id) ? "Unfollow" : "Follow"}
            </Button>
          </div>
        </div>
      );
    } else {
      // Group chat profile
      return (
        <div className="space-y-4 p-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border border-gray-200 dark:border-gray-800">
              <AvatarImage src={selectedChat?.groupImage} alt={selectedChat?.chatName} />
              <AvatarFallback className="text-xl">{selectedChat?.chatName?.charAt(0) || "G"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{selectedChat?.chatName}</h2>
            <p className="text-sm text-gray-500">{selectedChat?.users?.length} members</p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Members</h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedChat?.users?.map(user => (
                <div key={user._id} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImg} alt={user.fullName} />
                    <AvatarFallback>{user.fullName?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                  </div>
                  {user._id === selectedChat.groupAdmin && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };
  
  const renderMediaTab = () => {
    // This would be populated with actual media from the chat
    // For now, showing a placeholder
    return (
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div 
              key={item} 
              className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center"
            >
              <Image className="h-6 w-6 text-gray-400" />
            </div>
          ))}
        </div>
        
        <Separator />
        
        <h3 className="text-sm font-medium">Files</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div 
              key={item}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
                <FileIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Document-{item}.pdf</p>
                <p className="text-xs text-gray-500">2.4 MB</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderSettingsTab = () => {
    return (
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Chat Settings</h3>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                {isDirectMessage ? "Delete Chat" : "Leave Group"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isDirectMessage ? "Delete Chat" : "Leave Group"}
                </DialogTitle>
                <DialogDescription>
                  {isDirectMessage 
                    ? "Are you sure you want to delete this chat? This action cannot be undone."
                    : "Are you sure you want to leave this group? You'll need to be added back to rejoin."
                  }
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleLeaveChat}>
                  {isDirectMessage ? "Delete" : "Leave"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="font-semibold">Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details panel">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="profile" className="mt-0">
            {renderProfileTab()}
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            {renderMediaTab()}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            {renderSettingsTab()}
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default ChatDetailsPanel;
