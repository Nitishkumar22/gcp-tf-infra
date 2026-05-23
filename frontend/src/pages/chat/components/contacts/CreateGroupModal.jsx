import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { useChat } from '../../../../contexts/ChatContext';
import UserSearchSelect from './UserSearchSelect';
import { toast } from 'react-hot-toast';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupImage, setGroupImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createGroupChat } = useChat();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 users");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userIds = selectedUsers.map(user => user._id);
      await createGroupChat({ 
        name: groupName, 
        users: userIds, 
        groupImage 
      });
      
      toast.success("Group created successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group chat by adding members and giving it a name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="groupImage">Group Image URL (Optional)</Label>
            <Input
              id="groupImage"
              value={groupImage}
              onChange={(e) => setGroupImage(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Add Members</Label>
            <UserSearchSelect
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
