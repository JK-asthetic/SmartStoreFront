import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  X,
  Send,
  ShoppingBag,
  Truck,
  HelpCircle,
  Package,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
// import { useToast } from '@/components/ui/use-toast';

type Message = {
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  agentType?: string;
  products?: any[];
  orders?: any[];
  suggestedActions?: string[];
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [location, navigate] = useLocation();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  // const { toast } = useToast();

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);
  const userId = isAuthenticated && user?.id 
        ? user.id.toString() 
        : localStorage.getItem('userId') || 'anonymous';

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          type: "ai",
          content:
            "'Hello! I'm your shopping assistant. How can I help you today?'",
          timestamp: new Date(),
          suggestedActions: [
            "Browse popular products",
            "Check my order status",
            "Help with returns",
          ],
        },
      ]);
    }
  }, [messages.length]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
  
    if (!input.trim()) return;
  
    // Add user message to chat
    const userMessage: Message = {
      type: "user",
      content: input,
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
  
    try {
      // Send message to backend
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId, // Use stored user ID or anonymous
          message: input,
        }),
      });
  
      const data = await response.json();
  
      // Add AI response to chat
      const aiMessage: Message = {
        type: "ai",
        content: data.message,
        timestamp: new Date(),
        agentType: data.agent_type,
        products: data.products,
        orders: data.orders,
        suggestedActions: data.suggested_actions,
      };
  
      setMessages((prev) => [...prev, aiMessage]);
  
      // Handle filter commands and navigation
      if (data.filter_command && data.should_navigate) {
        // Close chat widget
        setIsOpen(false);
        
        // Navigate to products page
        navigate('/products');
        
        // Small delay to ensure navigation completes before applying filters
        setTimeout(() => {
          // Call the global applyAIFilters function
          if (window.applyAIFilters) {
            window.applyAIFilters(data.filter_command);
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Sorry, I encountered an error. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    setInput(action);
    inputRef.current?.focus();
  };

  const handleProductClick = (productId: string, productSlug: string) => {
    navigate(`/products/${productSlug}`);
    setIsOpen(false);

    // toast({
    //   title: "Navigating to product",
    //   description: "Opening product details page"
    // });
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/account?tab=orders&order=${orderId}`);
    setIsOpen(false);
    
    // toast({
    //   title: "Viewing Order Details",
    //   description: `Opening order #${orderId} in your account`
    // });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAgentIcon = (agentType?: string) => {
    switch (agentType) {
      case "product_recommendation":
        return <ShoppingBag className="h-4 w-4 mr-1" />;
      case "order_tracking":
        return <Truck className="h-4 w-4 mr-1" />;
      case "customer_support":
        return <HelpCircle className="h-4 w-4 mr-1" />;
      default:
        return <MessageCircle className="h-4 w-4 mr-1" />;
    }
  };

  // Function to get status color for order badges
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg"
        onClick={toggleChat}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat widget */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 sm:w-96 h-96 flex flex-col shadow-xl rounded-lg overflow-hidden">
          {/* Chat header */}
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <div className="font-medium">Shop Assistant</div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground h-8 w-8 p-0"
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.type === "user" ? "order-1" : "order-2"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.type === "ai" && message.agentType && (
                      <div className="flex items-center text-xs text-muted-foreground mb-1">
                        {getAgentIcon(message.agentType)}
                        {message.agentType === "product_recommendation" &&
                          "Product Assistant"}
                        {message.agentType === "order_tracking" &&
                          "Order Assistant"}
                        {message.agentType === "customer_support" &&
                          "Support Assistant"}
                        {![
                          "product_recommendation",
                          "order_tracking",
                          "customer_support",
                        ].includes(message.agentType) && "Shop Assistant"}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>

                    {/* Product recommendations */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-2 grid gap-2">
                        {message.products.map((product) => (
                          <div
                            key={product.id}
                            className="bg-background p-2 rounded shadow-sm text-xs cursor-pointer hover:bg-accent transition-colors"
                            onClick={() =>
                              handleProductClick(
                                product.id,
                                product.name.toLowerCase().replace(/\s+/g, "-")
                              )
                            }
                          >
                            <div className="font-medium">{product.name}</div>
                            <div className="flex justify-between mt-1">
                              <span>${product.price.toFixed(2)}</span>
                              <span className="text-muted-foreground">
                                {product.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order information - Redesigned */}
                    {message.orders && message.orders.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium mb-1 text-muted-foreground">Your Orders:</div>
                        {message.orders.map((order) => (
                          <div
                            key={order.order_id}
                            className="bg-background rounded-lg shadow-sm text-xs cursor-pointer hover:bg-accent/50 transition-colors border border-gray-100"
                            onClick={() => handleOrderClick(order.order_id)}
                          >
                            <div className="flex items-center justify-between p-2 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="font-medium">Order #{order.order_id}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="p-2">
                              <div className="grid grid-cols-2 gap-1">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium text-right">{order.date}</span>
                                <span className="text-muted-foreground">Total:</span>
                                <span className="font-medium text-right">${parseFloat(order.total).toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center p-1 bg-primary/10 text-primary text-xs">
                              <span>View Details</span>
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested actions */}
                    {message.suggestedActions &&
                      message.suggestedActions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.suggestedActions.map((action, i) => (
                            <button
                              key={i}
                              className="bg-background text-primary text-xs rounded-full px-2 py-1 hover:bg-accent transition-colors"
                              onClick={() => handleActionClick(action)}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  <div
                    className={`text-xs mt-1 text-muted-foreground ${
                      message.type === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 bg-muted rounded-md text-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 w-9 p-0"
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;