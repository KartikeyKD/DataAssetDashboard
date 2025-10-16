import React, { useState } from 'react';
import { X, Send, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your IndiGo Data Assistant. How can I help you with your data governance queries today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your question. I\'m currently in demo mode. In production, I would connect to your data governance API to provide real-time insights.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-8 right-8 z-50 transition-all duration-300",
          "w-16 h-16 rounded-full shadow-2xl",
          "bg-gradient-to-br from-indigo-600 to-blue-600",
          "hover:shadow-indigo-500/50 hover:scale-110",
          "flex items-center justify-center group",
          isOpen && "scale-0"
        )}
      >
        <Plane className="h-7 w-7 text-white transform rotate-45 group-hover:rotate-90 transition-transform duration-300" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full z-50 transition-all duration-500 ease-in-out",
          "bg-white shadow-2xl border-l border-gray-200",
          isOpen ? "w-[25%] min-w-[400px]" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">IndiGo Assistant</h3>
                <p className="text-blue-100 text-xs">Data Governance Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
                      message.sender === 'user'
                        ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.sender === 'user' ? "text-blue-100" : "text-gray-500"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your data governance..."
                className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

