'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Settings,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  metadata?: {
    type?: string;
    contextLoaded?: boolean;
    filesAnalyzed?: number;
  };
}

interface ChatSidebarProps {
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  onClearChat?: () => void;
  isLoading?: boolean;
}

export function ChatSidebar({ 
  messages: externalMessages, 
  onSendMessage: externalOnSendMessage, 
  onClearChat: externalOnClearChat,
  isLoading: externalIsLoading
}: ChatSidebarProps) {// Use external messages if provided, otherwise fallback to internal state
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Writing and reviewing code\n• Debugging issues\n• Explaining concepts\n• Generating components\n\nWhat would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      id: '2',
      content: 'Can you help me create a React component?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 4) // 4 minutes ago
    },
    {
      id: '3',
      content: 'Absolutely! Here\'s a simple React component template:\n\n```tsx\nimport React from \'react\';\n\ninterface Props {\n  title: string;\n  children: React.ReactNode;\n}\n\nexport function MyComponent({ title, children }: Props) {\n  return (\n    <div className="component-container">\n      <h2>{title}</h2>\n      <div>{children}</div>\n    </div>\n  );\n}\n```\n\nThis creates a reusable component with props for title and children. Would you like me to explain any part of it?',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 3) // 3 minutes ago
    },
    {
      id: '4',
      content: 'That\'s perfect! How about styling with CSS modules?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
    },
    {
      id: '5',
      content: 'Great question! Here\'s how you can use CSS modules:\n\n```css\n/* MyComponent.module.css */\n.container {\n  padding: 1rem;\n  border: 1px solid #ccc;\n  border-radius: 8px;\n}\n\n.title {\n  color: #333;\n  margin-bottom: 0.5rem;\n}\n```\n\n```tsx\nimport styles from \'./MyComponent.module.css\';\n\nexport function MyComponent({ title, children }: Props) {\n  return (\n    <div className={styles.container}>\n      <h2 className={styles.title}>{title}</h2>\n      <div>{children}</div>\n    </div>\n  );\n}\n```\n\nCSS modules provide scoped styling that won\'t conflict with other components!',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 1) // 1 minute ago
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [internalIsLoading, setInternalIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use external state if provided, otherwise use internal state
  const messages = externalMessages || internalMessages;
  const isLoading = externalIsLoading || internalIsLoading;

  // Handle sending message
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    if (externalOnSendMessage) {
      await externalOnSendMessage(message);
    } else {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };
      setInternalMessages(prev => [...prev, userMessage]);
      setInternalIsLoading(true);
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'This is a mock response.',
          sender: 'assistant',
          timestamp: new Date()
        };
        setInternalMessages(prev => [...prev, assistantMessage]);
        setInternalIsLoading(false);
      }, 1000);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full border-r bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => {
              if (externalOnClearChat) {
                externalOnClearChat();
              } else {
                setInternalMessages([
                  {
                    id: '1',
                    content: 'Hello! I\'m your AI coding assistant. I can help you with:\n\n• Writing and reviewing code\n• Debugging issues\n• Explaining concepts\n• Generating components\n\nWhat would you like to work on today?',
                    sender: 'assistant',
                    timestamp: new Date()
                  }
                ]);
              }
            }}
            title="Clear Chat"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-4 chat-scrollbar">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className="group">
              <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'assistant' && (
                  <Avatar className="w-8 h-8 flex-shrink-0 mr-3">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`px-3 py-2 rounded-xl max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted/40 border border-muted/50'
                }`}>
                  <div className="text-sm break-words whitespace-pre-wrap">{msg.content}</div>
                  <div className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'opacity-75' : 'text-muted-foreground'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="w-8 h-8 flex-shrink-0 ml-3">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Avatar className="w-8 h-8 flex-shrink-0 mr-3">
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/40 px-3 py-2 rounded-xl border border-muted/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">AI is typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Input */}
      <div className="p-3 border-t bg-background flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask me anything about code..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
