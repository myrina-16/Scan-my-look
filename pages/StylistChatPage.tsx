import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';

const StylistChatPage: React.FC = () => {
  const {
    chatSession,
    chatMessages,
    isChatLoading,
    isGeneratingImage,
    chatError,
    initializeChat,
    sendChatMessage,
    clearChat
  } = useAppContext();
  
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If there is no chat session and we are not currently trying to initialize one,
    // then start the initialization process. This triggers on first load and after a chat is cleared.
    if (!chatSession && !isChatLoading) {
      initializeChat();
    }
  }, [initializeChat, chatSession, isChatLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isChatLoading) {
      sendChatMessage(userInput.trim());
      setUserInput('');
    }
  };

  const handleNewChat = () => {
      // Clearing the chat will set chatSession to null, which will trigger the useEffect to re-initialize.
      clearChat();
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col h-screen">
      <header className="bg-white shadow-md p-4 flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
            <Icon icon="chat-bubble" className="w-8 h-8 text-brand-accent"/>
            <div>
                 <h1 className="text-xl font-bold text-brand-primary">AI Stylist Chat</h1>
                 <p className="text-xs text-slate-500">Your personal fashion assistant</p>
            </div>
        </div>
        <button onClick={handleNewChat} className="text-slate-500 hover:text-brand-primary font-semibold text-sm">New Chat</button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isChatLoading && chatMessages.length === 0 ? (
             <div className="flex items-center justify-center h-full">
                <LoadingSpinner text="Connecting to your stylist..." />
            </div>
        ) : (
          <>
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-white flex-shrink-0"><Icon icon="sparkles" className="w-5 h-5"/></div>}
                <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-brand-accent text-white rounded-br-none'
                    : 'bg-white text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="AI generated outfit" className="rounded-lg mb-2" />
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isChatLoading && chatMessages.length > 0 && (
                <div className="flex items-end gap-3 justify-start">
                     <div className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-white flex-shrink-0"><Icon icon="sparkles" className="w-5 h-5"/></div>
                     <div className="p-3 rounded-2xl bg-white shadow-sm rounded-bl-none">
                        {isGeneratingImage ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Icon icon="brush" className="w-4 h-4 animate-pulse" />
                                <span>Generating image...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                            </div>
                        )}
                     </div>
                </div>
            )}
    
            {chatError && (
                 <div className="bg-red-100 border-l-4 border-feedback-red text-red-700 p-4 rounded-lg my-6 text-center">
                    <p className="font-bold">Error</p>
                    <p className="text-sm">{chatError}</p>
                </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-4 border-t z-10 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask for style advice..."
            className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            disabled={isChatLoading}
          />
          <button
            type="submit"
            disabled={isChatLoading || !userInput.trim()}
            className="bg-brand-accent text-white rounded-full p-3 shadow-lg hover:bg-opacity-90 disabled:bg-slate-400 disabled:cursor-not-allowed transform transition-transform hover:scale-110"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default StylistChatPage;