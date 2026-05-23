import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { X, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

const UserSearchSelect = ({ selectedUsers, setSelectedUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();
  
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      
      // Get all users we've chatted with
      const chatResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/chat`, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
        }
      });
      
      let chatUsers = [];
      if (chatResponse.ok) {
        const chats = await chatResponse.json();
        // Extract all users from chats
        chatUsers = chats.flatMap(chat => chat.users || []);
      }
      
      // Get current user profile to get following list
      const profileResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/profile/${authUser.username}`, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
        }
      });
      
      let followingUsers = [];
      if (profileResponse.ok) {
        const userProfile = await profileResponse.json();
        
        // If we have following IDs, fetch those users directly from our chat users
        // or try to find them by username that matches our search query
        if (userProfile.following && userProfile.following.length > 0) {
          // Get users from chat that match following IDs
          const followingIds = userProfile.following;
          
          // Find users from chat that match our following IDs
          const matchingChatUsers = chatUsers.filter(user => 
            followingIds.includes(user._id)
          );
          
          followingUsers = matchingChatUsers;
          
          // Also try to find users by searching their profiles directly
          // This is a workaround since we don't have a direct API to get users by ID
          if (query.length >= 3) {
            // Try to find users by username that match our query
            // We'll search for users we follow by trying their username
            const searchByUsername = await fetch(`${import.meta.env.VITE_BASE_URL}/api/users/profile/${query}`, {
              credentials: "include",
              headers: {
                "Accept": "application/json",
              }
            }).catch(() => ({ ok: false })); // Catch 404 errors
            
            if (searchByUsername.ok) {
              const foundUser = await searchByUsername.json();
              // Check if this user is in our following list and not already in results
              if (foundUser && 
                  followingIds.includes(foundUser._id) && 
                  !followingUsers.some(u => u._id === foundUser._id)) {
                followingUsers.push(foundUser);
              }
            }
          }
        }
      }
      
      // Combine all users
      const allUsers = [...chatUsers, ...followingUsers];
      
      // Remove duplicates
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user._id, user])).values()
      );
      
      // Filter results to match search term
      const matchingUsers = uniqueUsers.filter(user => 
        // Exclude current user
        user._id !== authUser?._id && 
        // Exclude already selected users
        !selectedUsers.some(selectedUser => selectedUser._id === user._id) &&
        // Match search term against name or username
        (user.fullName?.toLowerCase().includes(query.toLowerCase()) || 
         user.username?.toLowerCase().includes(query.toLowerCase()))
      );
      
      setSearchResults(matchingUsers);
    } catch (error) {
      console.error("Search users error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSelect = (user) => {
    if (!selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };
  
  const handleRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedUsers.map(user => (
          <Badge key={user._id} variant="secondary" className="flex items-center gap-1 py-1 px-2">
            <Avatar className="h-4 w-4 mr-1">
              <AvatarImage src={user.profileImg} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.fullName}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer" 
              onClick={() => handleRemove(user._id)}
            />
          </Badge>
        ))}
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="border rounded-md max-h-40 overflow-y-auto">
          {searchResults.map(user => (
            <div
              key={user._id}
              onClick={() => handleSelect(user)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImg} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchTerm && searchResults.length === 0 && !loading && (
        <p className="text-sm text-gray-500 py-1">No users found</p>
      )}
    </div>
  );
};

export default UserSearchSelect;
