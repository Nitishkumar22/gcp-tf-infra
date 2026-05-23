import { useRef, useEffect } from 'react';
import { useChat } from '../../../../../contexts/ChatContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Message from './Message';

const MessageContainer = ({ messages = [], isLoading }) => {
  const { isTyping, selectedChat } = useChat();
  const { authUser } = useAuth();
  const scrollRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }
  
  return (
    <div 
      ref={scrollRef}
      className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-4 md:px-6 w-full'
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <>
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Message 
                  key={message._id}
                  message={message}
                  isOwnMessage={message.sender._id === authUser?._id}
                />
              ))}
            </div>
          )}
          
          {isTyping && (
            <div className="text-gray-500 text-sm mt-2 flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
              <span>Someone is typing...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageContainer;