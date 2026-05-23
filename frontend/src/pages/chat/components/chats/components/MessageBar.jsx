import { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, SendHorizontal, Loader2, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../../../../../contexts/ChatContext';
import { toast } from 'react-hot-toast';

const MessageBar = ({ chatId }) => {
  const emojiRef = useRef();
  const [message, setMessage] = useState(() => {
    // Initialize message from localStorage if available
    if (chatId) {
      const savedMessage = localStorage.getItem(`draft_message_${chatId}`);
      return savedMessage || '';
    }
    return '';
  });
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage, startTyping, stopTyping } = useChat();
  const fileInputRef = useRef(null);
  
  // Handle click outside emoji picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emojiRef]);
  
  // Load saved draft when chatId changes
  useEffect(() => {
    if (chatId) {
      const savedMessage = localStorage.getItem(`draft_message_${chatId}`);
      if (savedMessage) {
        setMessage(savedMessage);
      } else {
        setMessage('');
      }
    }
  }, [chatId]);
  
  // Save draft message to localStorage
  useEffect(() => {
    if (chatId && message) {
      localStorage.setItem(`draft_message_${chatId}`, message);
    }
  }, [message, chatId]);
  
  // Handle typing indicator with debounce
  useEffect(() => {
    if (!chatId) return;
    
    const typingTimeout = setTimeout(() => {
      if (message) {
        startTyping(chatId);
      } else {
        stopTyping(chatId);
      }
    }, 500);
    
    return () => clearTimeout(typingTimeout);
  }, [message, chatId, startTyping, stopTyping]);
  
  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (chatId) {
        stopTyping(chatId);
      }
    };
  }, [chatId, stopTyping]);
  
  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (!chatId) return;
    
    setIsLoading(true);
    
    try {
      await sendMessage({ 
        content: message.trim(), 
        chatId, 
        attachments 
      });
      
      // Clear message, localStorage draft, and attachments after sending
      setMessage('');
      localStorage.removeItem(`draft_message_${chatId}`);
      setAttachments([]);
      stopTyping(chatId);
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // For simplicity, we'll just store the file names
    // In a real app, you would upload these files to a server
    setAttachments(prev => [
      ...prev, 
      ...files.map(file => file.name)
    ]);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  if (!chatId) return null;
  
  return (
    <div className='h-[8vh] flex justify-center items-center border-2 rounded-full px-4 mx-4 mb-4'>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect} 
        multiple 
      />
      
      <div className='w-full flex rounded-md items-center gap-5'>
        <input
          type='text'
          className='flex-1 px-5 rounded-md focus:border-none focus:outline-none'
          placeholder="Enter Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <button 
          className='text-neutral-900 focus:border-none focus:outline-none'
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Paperclip className="text-gray-400 hover:text-gray-700" />
        </button>
        
        <div className='relative flex gap-2'>
          <button 
            className='text-neutral-900 focus:border-none focus:outline-none'
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            disabled={isLoading}
          >
            <Smile className='text-gray-400 hover:text-gray-700' />
          </button>
          
          {emojiPickerOpen && (
            <div className='absolute bottom-14 right-0 z-10' ref={emojiRef}>
              <EmojiPicker 
                height={300} 
                width={400}
                theme="dark" 
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
                searchDisabled
              />
            </div>
          )}
        </div>
      </div>
      
      <button 
        className='rounded-md flex items-center justify-center pl-5 focus:border-none focus:outline-none'
        onClick={handleSendMessage}
        disabled={isLoading || (!message.trim() && attachments.length === 0)}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
        ) : (
          <SendHorizontal className="text-gray-600 hover:text-black" />
        )}
      </button>
      
      {/* Display attachments if any */}
      {attachments.length > 0 && (
        <div className="absolute bottom-16 left-4 right-4 bg-white border rounded-md p-2 shadow-md">
          <div className="text-sm font-medium mb-1">Attachments:</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="bg-gray-100 rounded px-2 py-1 text-xs flex items-center gap-1">
                <span className="truncate max-w-[100px]">{attachment}</span>
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBar;
