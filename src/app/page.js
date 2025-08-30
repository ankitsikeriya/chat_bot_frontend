import React, { useState, useRef, useEffect } from 'react';
export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'bot' },
    { id: 2, text: "I'm looking for a new project idea for my portfolio. Can you help me brainstorm?", sender: 'user' },
    { id: 3, text: "Certainly! What are your interests? For example, are you into data visualization, web development, or maybe something with a bit of a challenge like a game?", sender: 'bot' },
    { id: 4, text: "I'm open to anything creative! I'd like to build something that uses AI.", sender: 'user' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const GEMINI_API_KEY = ""; // Replace with your actual Gemini API key

  // This function scrolls the chat to the bottom on new messages.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetches a response from the Gemini API
  const getGeminiResponse = async (prompt) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      return result?.candidates?.[0]?.content?.parts?.[0]?.text || "An error occurred. Please try again.";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "I'm sorry, I couldn't connect to the AI. Please check your network and try again.";
    }
  };

  // Handles sending a message.
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage = { id: messages.length + 1, text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    const botResponseText = await getGeminiResponse(`Respond to the following prompt: ${input}`);
    const botResponse = {
      id: messages.length + 2,
      text: botResponseText,
      sender: 'bot'
    };
    setMessages(prevMessages => [...prevMessages, botResponse]);
    setIsLoading(false);
  };
  
  // Handles generating a poem with the Gemini API
  const handleGeneratePoem = async () => {
    if (isLoading) return;
    const lastUserMessage = messages.filter(msg => msg.sender === 'user').pop();
    if (!lastUserMessage) {
      alert("Please send a message first to generate a poem.");
      return;
    }
    
    setIsLoading(true);
    const prompt = `Write a short, creative poem inspired by this topic: ${lastUserMessage.text}`;
    const poemText = await getGeminiResponse(prompt);

    const poemMessage = {
      id: messages.length + 1,
      text: `***Poem Generated***\n\n${poemText}`,
      sender: 'bot'
    };
    setMessages(prevMessages => [...prevMessages, poemMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] font-sans antialiased text-gray-200">
      {/* Main Chat Container */}
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full relative">

        {/* Header and Greeting */}
        <div className="flex-none text-center pt-8 pb-4">
          <p className="text-gray-400">
            <span className="text-[#ff7e5f] mr-2 text-2xl">•</span>
            Good afternoon, agentic
          </p>
        </div>

        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] rounded-xl p-3 shadow-md 
                ${msg.sender === 'user' ? 'bg-[#3b3b3b] text-gray-200' : 'bg-[#2a2a2a] text-gray-200'}`}
              >
                <p className="break-words whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#2a2a2a] rounded-xl p-3 shadow-md">
                <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-500 h-6 w-6 animate-spin"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Form */}
        <div className="fixed bottom-0 left-0 right-0 p-4 z-10 flex justify-center">
            <form onSubmit={handleSendMessage} className="relative flex items-center w-full max-w-2xl bg-[#3b3b3b] rounded-2xl shadow-xl p-2 gap-2">
                <button 
                  type="button" 
                  onClick={handleGeneratePoem} 
                  disabled={isLoading}
                  className="text-gray-400 hover:text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl">✨</span>
                </button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none px-2 py-2 focus:outline-none placeholder-gray-500"
                    placeholder="Reply to Claude..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-[#3e5f8a] text-white p-2 rounded-full shadow-lg hover:bg-[#5a80b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                    disabled={isLoading}
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

