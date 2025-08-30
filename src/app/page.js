'use client'
import React, { useState, useRef, useEffect } from 'react';
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // This function scrolls the chat to the bottom on new messages.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Handles sending a message.
  const handleSendMessage = async(e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

     // Add user message to the chat history.
    const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // API call to the backend
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add the bot's response to the chat history.
      const botResponse = {
        id: messages.length + 2,
        text: data.message, // Assuming the backend returns { "reply": "..." }
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);

    } catch (error) {
      console.error("Error connecting to backend:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I couldn't connect to the backend. Please check if the server is running.",
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] font-sans antialiased text-gray-200">
      {/* Main Chat Container */}
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full relative">

        {/* Header and Greeting */}
        <div className="flex-none text-center pt-8 pb-4">
          <p className="text-gray-400">
            <span className="text-[#ff7e5f] mr-2 text-2xl">•</span>
            Hello , I'm a Real time Chat Bot! Who fetches and analyzes information using LLM powered with websearch using Tavily API.
          </p>
        </div>

        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
          {console.log(messages)}
          {messages.map((msg) => (
            
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] rounded-xl p-3 shadow-md 
                ${msg.sender === 'user' ? 'bg-[#3b3b3b] text-gray-200' : 'bg-[#2a2a2a] text-gray-200'}`}
              >
                <p className="break-words">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Form */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-10 flex justify-center">
            <form onSubmit={handleSendMessage} className="relative flex items-center w-full max-w-2xl bg-[#3b3b3b] rounded-2xl shadow-xl p-2 gap-2">
                <button type="button" className="text-gray-400 hover:text-white p-2 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none px-2 py-2 focus:outline-none placeholder-gray-500"
                    placeholder="What's the weather in Bhopal today ...?"
                />
                <button
                    type="submit"
                    className="bg-[#3e5f8a] text-white p-2 rounded-full shadow-lg hover:bg-[#5a80b0] transition-colors"
                    aria-label="Send message"
                >
                    {/* Send icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"></path>
                    </svg>
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}
