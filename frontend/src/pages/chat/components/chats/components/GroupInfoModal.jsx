import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { useChat } from '../../../../../contexts/ChatContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { X, UserPlus, Pencil } from 'lucide-react';
import UserSearchSelect from '../../contacts/UserSearchSelect';
import { toast } from 'react-hot-toast';

const GroupInfoModal = ({ isOpen, onClose, chat }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState(chat?.chatName || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { renameGroup, addToGroup, removeFromGroup } = useChat();
  const { authUser } = useAuth();
  
  const isAdmin = chat?.groupAdmin?._id === authUser?._id;
  
  const handleSaveGroupName = async () => {
    if (!groupName.trim() || groupName === chat.chatName) {
      setIsEditing(false);
      setGroupName(chat.chatName);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await renameGroup({ chatId: chat._id, chatName: groupName });
      toast.success("Group name updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Failed to update group name");
      setGroupName(chat.chatName);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      setIsAddingMembers(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userIds = selectedUsers.map(user => user._id);
      await addToGroup({ chatId: chat._id, users: userIds });
      
      toast.success("Members added successfully");
      setIsAddingMembers(false);
      setSelectedUsers([]);
    } catch (error) {
      toast.error(error.message || "Failed to add members");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveMember = async (userId) => {
    if (!isAdmin) return;
    
    try {
      await removeFromGroup({ chatId: chat._id, userId });
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to remove member");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Group Information</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={chat.groupImage} alt={chat.chatName} />
            <AvatarFallback>{chat.chatName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="mt-4 w-full space-y-2">
              <Label htmlFor="groupName">Group Name</Label>
              <div className="flex gap-2">
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => {
                    setIsEditing(false);
                    setGroupName(chat.chatName);
                  }}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  onClick={handleSaveGroupName}
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <h3 className="text-xl font-semibold">{chat.chatName}</h3>
              {isAdmin && (
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-500">{chat.users.length} members</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Members</h4>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAddingMembers(!isAddingMembers)}
                disabled={isLoading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            )}
          </div>
          
          {isAddingMembers && (
            <div className="space-y-2">
              <UserSearchSelect
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsAddingMembers(false);
                    setSelectedUsers([]);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAddMembers}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {chat.users.map(user => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImg} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {user._id === chat.groupAdmin._id ? 'Admin' : 'Member'}
                    </p>
                  </div>
                </div>
                
                {isAdmin && user._id !== authUser._id && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveMember(user._id)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupInfoModal;
