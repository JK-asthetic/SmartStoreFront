import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send } from "lucide-react";
import { Ollama } from "ollama";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm Gemma, how can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ollamaClient = useRef<Ollama | null>(null);

  // Initialize Ollama client
  useEffect(() => {
    // Create Ollama client - connect to localhost
    ollamaClient.current = new Ollama({
      host: "http://localhost:11434",
    });
    
    return () => {
      // Cleanup if needed
      ollamaClient.current = null;
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading || !ollamaClient.current) return;
    
    // Add user message
    const userMessage: Message = {
      text: newMessage,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    try {
      // Convert messages to Ollama format
      const ollamaMessages = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Add a placeholder for the streaming response
      const botResponseId = Date.now();
      setMessages((prev) => [
        ...prev, 
        { 
          text: "", 
          isUser: false, 
          timestamp: new Date(), 
          isStreaming: true 
        }
      ]);
      
      // Stream response from Ollama
      const stream = await ollamaClient.current.chat({
        model: 'gemma:2b',
        messages: [
          ...ollamaMessages,
          { role: 'user', content: newMessage }
        ],
        stream: true,
      });
      
      let responseText = "";
      
      for await (const chunk of stream) {
        responseText += chunk.message.content;
        
        // Update the streaming message with new content
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessageIndex = updatedMessages.length - 1;
          
          if (updatedMessages[lastMessageIndex].isStreaming) {
            updatedMessages[lastMessageIndex] = {
              ...updatedMessages[lastMessageIndex],
              text: responseText,
            };
          }
          
          return updatedMessages;
        });
      }
      
      // Mark streaming as complete
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastMessageIndex = updatedMessages.length - 1;
        
        if (updatedMessages[lastMessageIndex].isStreaming) {
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            isStreaming: false,
          };
        }
        
        return updatedMessages;
      });
      
    } catch (error) {
      console.error('Error calling Ollama:', error);
      
      const errorMessage: Message = {
        text: "Sorry, there was an error connecting to the AI model. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => {
        // Replace streaming message with error if it exists
        if (prev[prev.length - 1].isStreaming) {
          return [...prev.slice(0, -1), errorMessage];
        }
        return [...prev, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={toggleChat}
        className="bg-secondary hover:bg-secondary/90 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all focus:outline-none"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-primary p-4 flex justify-between items-center">
            <h3 className="text-white font-medium">Gemma AI Assistant</h3>
            <Button 
              variant="ghost" 
              onClick={toggleChat} 
              className="text-white hover:text-secondary p-0 h-auto"
            >
              <X size={18} />
            </Button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-gray-50" id="chatMessages">
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-4 ${msg.isUser ? 'justify-end' : ''}`}>
                <div className={`rounded-lg py-2 px-4 max-w-[75%] ${
                  msg.isUser 
                    ? 'bg-accent text-white' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  <p>{msg.text}</p>
                  {msg.isStreaming && (
                    <span className="inline-block ml-1 animate-pulse">▌</span>
                  )}
                  <span className={`text-xs ${
                    msg.isUser ? 'text-white/80' : 'text-gray-500'
                  } mt-1 block`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && !messages[messages.length - 1]?.isStreaming && (
              <div className="flex mb-4">
                <div className="bg-primary/10 text-primary rounded-lg py-2 px-4 max-w-[75%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex">
              <Input
                type="text"
                placeholder="Type your message..."
                className="flex-grow border border-gray-300 rounded-l-full py-2 px-4 focus:outline-none focus:border-accent"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button 
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white px-4 rounded-r-full focus:outline-none transition-all"
                disabled={isLoading}
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}