import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const ChatContext = createContext();

let socket;
const ENDPOINT = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const ChatProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { authUser } = useAuth();
  
  // Initialize selectedChat from localStorage if available
  const [selectedChat, setSelectedChatState] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Custom setter for selectedChat that also updates localStorage
  const setSelectedChat = useCallback((chat) => {
    setSelectedChatState(chat);
    if (chat) {
      localStorage.setItem('selectedChatId', chat._id);
    } else {
      localStorage.removeItem('selectedChatId');
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (authUser) {
      socket = io(ENDPOINT);
      socket.emit("setup", authUser);
      socket.on("connected", () => setSocketConnected(true));
      
      // Set user as online
      socket.emit("user online", authUser._id);
      
      // Handle user status updates
      socket.on("user status", ({ userId, status }) => {
        if (status === "online") {
          setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
        } else {
          setOnlineUsers(prev => prev.filter(id => id !== userId));
        }
      });
      
      return () => {
        // Clean up socket connection
        if (socket) {
          socket.emit("user offline", authUser._id);
          socket.disconnect();
        }
      };
    }
  }, [authUser]);

  // Handle typing indicators
  useEffect(() => {
    if (socket) {
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }
    
    return () => {
      if (socket) {
        socket.off("typing");
        socket.off("stop typing");
      }
    };
  }, [socket]);

  // Handle new message notifications
  useEffect(() => {
    if (socket) {
      socket.on("message received", (newMessageReceived) => {
        // If chat is not selected or doesn't match current chat
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // Add notification
          if (!notifications.some(n => n._id === newMessageReceived._id)) {
            setNotifications([newMessageReceived, ...notifications]);
            // Refresh chats to update latest message
            queryClient.invalidateQueries({ queryKey: ["chats"] });
          }
        } else {
          // Update messages in the current chat
          queryClient.setQueryData(["messages", selectedChat._id], (old) => {
            return old ? [...old, newMessageReceived] : [newMessageReceived];
          });
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off("message received");
      }
    };
  }, [notifications, queryClient, selectedChat, socket]);

  // Fetch all chats
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      try {
        const response = await fetch(`${ENDPOINT}/api/chat`, {
          credentials: "include",
          headers: {
            "Accept": "application/json",
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Fetch chats error:", error);
        return [];
      }
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
  
  // Load selected chat from localStorage when chats are available
  useEffect(() => {
    if (authUser && chats?.length > 0 && !selectedChat) {
      const savedChatId = localStorage.getItem('selectedChatId');
      if (savedChatId) {
        const savedChat = chats.find(chat => chat._id === savedChatId);
        if (savedChat) {
          setSelectedChatState(savedChat); // Use direct state setter to avoid infinite loop
        }
      }
    }
  }, [authUser, chats, selectedChat]);

  // Fetch messages for a specific chat
  const fetchMessages = useCallback((chatId) => {
    return queryClient.fetchQuery({
      queryKey: ["messages", chatId],
      queryFn: async () => {
        try {
          const response = await fetch(`${ENDPOINT}/api/message/${chatId}`, {
            credentials: "include",
            headers: {
              "Accept": "application/json",
            }
          });
          
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          
          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Fetch messages error:", error);
          return [];
        }
      },
      staleTime: 1000 * 30, // 30 seconds
    });
  }, [queryClient]);

  // Send a message
  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ content, chatId, attachments = [] }) => {
      const response = await fetch(`${ENDPOINT}/api/message`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ content, chat: chatId, attachments }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send message");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update messages cache
      queryClient.setQueryData(["messages", data.chat._id], (old) => {
        return old ? [...old, data] : [data];
      });
      
      // Update chats with latest message
      queryClient.setQueryData(["chats"], (old) => {
        if (!old) return old;
        
        return old.map(chat => 
          chat._id === data.chat._id 
            ? { ...chat, latestMessage: data } 
            : chat
        );
      });
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("new message", data);
      }
    },
    onError: (error) => {
      console.error("Send message error:", error);
    }
  });

  // Create or access a one-on-one chat
  const { mutate: accessChat } = useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`${ENDPOINT}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to access chat");
      }
      
      return await response.json();
    },
    onSuccess: (data, variables, context, options) => {
      // Update chats cache if the chat doesn't exist
      queryClient.setQueryData(["chats"], (old) => {
        if (!old) return [data];
        // Remove any existing version of this chat
        const filteredChats = old.filter(c => c._id !== data._id);
        // Add the new/updated chat at the beginning
        return [data, ...filteredChats];
      });
      
      // Set as selected chat
      setSelectedChat(data);
      
      // If there's a custom onSuccess handler from the caller, call it
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Access chat error:", error);
    }
  });

  // Create a group chat
  const { mutate: createGroupChat } = useMutation({
    mutationFn: async ({ name, users, groupImage }) => {
      const response = await fetch(`${ENDPOINT}/api/chat/group`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ name, users, groupImage }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create group chat");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update chats cache
      queryClient.setQueryData(["chats"], (old) => {
        return old ? [data, ...old] : [data];
      });
      
      // Set as selected chat
      setSelectedChat(data);
    },
    onError: (error) => {
      console.error("Create group chat error:", error);
    }
  });

  // Add users to a group
  const { mutate: addToGroup } = useMutation({
    mutationFn: async ({ chatId, users }) => {
      const response = await fetch(`${ENDPOINT}/api/chat/group/add`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ chatId, users }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add users to group");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update chats cache
      queryClient.setQueryData(["chats"], (old) => {
        return old ? old.map(c => c._id === data._id ? data : c) : [data];
      });
      
      // Update selected chat if it's the modified chat
      if (selectedChat?._id === data._id) {
        setSelectedChat(data);
      }
    },
    onError: (error) => {
      console.error("Add to group error:", error);
    }
  });

  // Remove a user from a group
  const { mutate: removeFromGroup } = useMutation({
    mutationFn: async ({ chatId, userId }) => {
      const response = await fetch(`${ENDPOINT}/api/chat/group/remove`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ chatId, userId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to remove user from group");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update chats cache
      queryClient.setQueryData(["chats"], (old) => {
        return old ? old.map(c => c._id === data._id ? data : c) : [data];
      });
      
      // Update selected chat if it's the modified chat
      if (selectedChat?._id === data._id) {
        setSelectedChat(data);
      }
    },
    onError: (error) => {
      console.error("Remove from group error:", error);
    }
  });

  // Rename a group
  const { mutate: renameGroup } = useMutation({
    mutationFn: async ({ chatId, chatName }) => {
      const response = await fetch(`${ENDPOINT}/api/chat/group/rename`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ chatId, chatName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to rename group");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update chats cache
      queryClient.setQueryData(["chats"], (old) => {
        return old ? old.map(c => c._id === data._id ? data : c) : [data];
      });
      
      // Update selected chat if it's the renamed chat
      if (selectedChat?._id === data._id) {
        setSelectedChat(data);
      }
    },
    onError: (error) => {
      console.error("Rename group error:", error);
    }
  });

  // Typing indicator functions
  const startTyping = useCallback((chatId) => {
    if (!socket || !chatId) return;
    
    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }
  }, [socket, typing]);

  const stopTyping = useCallback((chatId) => {
    if (!socket || !chatId) return;
    
    if (typing) {
      setTyping(false);
      socket.emit("stop typing", chatId);
    }
  }, [socket, typing]);

  // Mark message as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (messageId) => {
      const response = await fetch(`${ENDPOINT}/api/message/${messageId}/read`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Accept": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to mark message as read");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update messages cache
      queryClient.setQueryData(["messages", data.chat._id], (old) => {
        if (!old) return old;
        return old.map(msg => msg._id === data._id ? data : msg);
      });
    },
    onError: (error) => {
      console.error("Mark as read error:", error);
    }
  });

  // Join a chat room (for socket.io)
  const joinChatRoom = useCallback((chatId) => {
    if (socket && chatId) {
      socket.emit("join chat", chatId);
    }
  }, [socket]);

  // Remove a notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  }, []);

  // Function to navigate to a chat with a specific user
  const navigateToChat = useCallback((userId, navigate) => {
    if (!navigate) {
      console.error('Navigate function not provided');
      return;
    }
    
    try {
      // First, force refresh the chats list to get the latest data
      refetchChats().then(() => {
        // Then call accessChat with the userId
        accessChat(userId, {
          onSuccess: (data) => {
            // After successful chat creation/access, set selected chat
            setSelectedChat(data);
            
            // Navigate to chat page
            navigate('/chat');
            
            // Force another refresh to ensure UI is updated
            setTimeout(() => {
              refetchChats();
            }, 500);
          }
        });
      }).catch(err => {
        console.error('Error refreshing chats:', err);
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
      toast.error('Failed to open chat');
    }
  }, [accessChat, setSelectedChat, refetchChats]);

  return (
    <ChatContext.Provider value={{
      chats,
      chatsLoading,
      selectedChat,
      setSelectedChat,
      socketConnected,
      typing,
      isTyping,
      notifications,
      setNotifications,
      removeNotification,
      onlineUsers,
      fetchMessages,
      sendMessage,
      accessChat,
      createGroupChat,
      addToGroup,
      removeFromGroup,
      renameGroup,
      startTyping,
      stopTyping,
      markAsRead,
      joinChatRoom,
      refetchChats,
      navigateToChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
