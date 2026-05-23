import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyChatContainer from './components/empty-chat/EmptyChatContainer';
import ContactsContainer from './components/contacts/ContactsContainer';
import ChatContainer from './components/chats/ChatContainer';
import { ChatProvider, useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const ChatWrapper = () => {
  const { selectedChat } = useChat();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  
  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      setShowContacts(isMobile ? !selectedChat : true);
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [selectedChat]);
  
  // Toggle contacts visibility on mobile
  const toggleContacts = () => {
    if (isMobileView) {
      setShowContacts(prev => !prev);
    }
  };
  
  return (
    <div className='flex pt-12 h-screen w-full text-black overflow-hidden'>
      {(showContacts || !isMobileView) && (
        <div className={`${isMobileView ? 'absolute inset-0 z-40 bg-white' : 'relative'}`}>
          <ContactsContainer onSelectChat={() => isMobileView && setShowContacts(false)} />
        </div>
      )}
      
      {(!showContacts || !isMobileView) && selectedChat ? (
        <div className={`${isMobileView ? 'w-full' : 'flex-1'} max-w-full overflow-hidden`}>
          <ChatContainer onBackClick={toggleContacts} isMobileView={isMobileView} />
        </div>
      ) : (!showContacts || !isMobileView) ? (
        <EmptyChatContainer />
      ) : null}
    </div>
  );
};

const Chat = () => {
  const navigate = useNavigate();
  const { authUser, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !authUser) {
      navigate("/login");
    }
  }, [authUser, isLoading, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!authUser) return null;
  
  return <ChatWrapper />;
};

export default Chat;