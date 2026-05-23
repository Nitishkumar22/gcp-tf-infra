import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import { useAuth } from '../../../../../contexts/AuthContext';

const Message = ({ message, isOwnMessage }) => {
  const { authUser } = useAuth();
  const isRead = message.readBy?.some(user => user._id === authUser?._id) || isOwnMessage;
  
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender.profileImg} alt={message.sender.fullName} />
            <AvatarFallback>{message.sender.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col">
          <div 
            className={`px-4 py-2 rounded-2xl ${
              isOwnMessage 
                ? 'bg-gray-900 text-white rounded-br-none' 
                : 'bg-gray-100 text-black rounded-bl-none'
            }`}
          >
            {message.content}
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2">
                {message.attachments.map((attachment, index) => (
                  <a 
                    key={index} 
                    href={attachment} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span>
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
            
            {isOwnMessage && (
              <span>
                {message.readBy && message.readBy.length > 0 ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
