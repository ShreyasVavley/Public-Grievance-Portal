"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChatBubbleLeftRightIcon, XMarkIcon, MicrophoneIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function MayaChatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'maya', text: t('maya_greeting') }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !showBubble) {
        setShowBubble(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showBubble]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleExternalMessage = (e) => {
      setMessages(prev => [...prev, { role: 'maya', text: e.detail.text }]);
      if (!isOpen) setIsOpen(true);
    };
    window.addEventListener('maya-message', handleExternalMessage);
    return () => window.removeEventListener('maya-message', handleExternalMessage);
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    setMessages([...messages, { role: 'user', text }]);
    setInput('');
    
    // Simulating AI interaction that "detects" intent
    setTimeout(() => {
      let responseText = "I've understood your concern. Would you like me to open the grievance form for you?";
      if (text.toLowerCase().includes('garbage') || text.toLowerCase().includes('ಕಸ')) {
        responseText = "I've detected a concern about Garbage. I can help you file a report for this immediately.";
      }
      setMessages(prev => [...prev, { 
        role: 'maya', 
        text: responseText
      }]);
    }, 1000);
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-IN'; // Default, toggleable
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 border border-gray-200 overflow-hidden flex flex-col mb-4 h-[500px]"
          >
            {/* Header */}
            <div className="bg-navy-blue text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
                  M
                </div>
                <div>
                  <h3 className="font-bold">Maya</h3>
                  <p className="text-xs text-blue-200">Conversational Concierge</p>
                </div>
              </div>
              <button onClick={toggleChat}><XMarkIcon className="w-6 h-6" /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-navy-blue text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-navy-blue rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 flex items-center gap-2 bg-white">
              <button 
                onClick={startVoice}
                className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your concern..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-navy-blue text-sm"
              />
              <button 
                onClick={() => handleSend()}
                className="p-2 bg-navy-blue text-white rounded-full"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-20 right-0 bg-white brutalist-card p-4 w-64 text-navy-blue font-bold text-lg"
          >
            Can I help you file a complaint via voice?
            <div className="absolute bottom-[-12px] right-8 w-6 h-6 bg-white border-r-4 border-b-4 border-navy-blue rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          toggleChat();
          setShowBubble(false);
        }}
        className="w-20 h-20 bg-navy-blue text-white brutalist-button flex items-center justify-center relative group"
        aria-label="Open Maya AI Concierge"
        aria-haspopup="true"
      >
        <ChatBubbleLeftRightIcon className="w-10 h-10" />
        <span className="absolute -top-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></span>
      </motion.button>
    </div>
  );
}
