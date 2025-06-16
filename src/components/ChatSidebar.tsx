'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Settings,
  MoreVertical,
  Copy,
  ThumbsUp,
  ThumbsDown,
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
  onCodeInsert?: (code: string) => void;
  messages?: ChatMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  onClearChat?: () => void;
  isLoading?: boolean;
}

export function ChatSidebar({ 
  onCodeInsert, 
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
    
    try {
      if (externalOnSendMessage) {
        // Use external handler
        await externalOnSendMessage(message);
      } else {
        // Use internal handler
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          content: message,
          sender: 'user',
          timestamp: new Date()
        };

        setInternalMessages(prev => [...prev, userMessage]);
        setInternalIsLoading(true);

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: generateMockResponse(message),
            sender: 'assistant',
            timestamp: new Date()
          };
          setInternalMessages(prev => [...prev, assistantMessage]);
          setInternalIsLoading(false);
        }, 1000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      // Reset loading state if external handler fails
      if (externalOnSendMessage) {
        // External handlers should manage their own loading states
        // but we should ensure input is restored on error
        setInputValue(message);
      } else {
        setInternalIsLoading(false);
        // Add error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Failed to send message. Please try again.',
          sender: 'assistant',
          timestamp: new Date()
        };
        setInternalMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('component') || input.includes('react')) {
      return `Here's a React component example:

\`\`\`tsx
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: Props) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
\`\`\`

Would you like me to explain any part of this component or help you customize it?`;
    }
    
    if (input.includes('bug') || input.includes('error') || input.includes('debug')) {
      return `I'd be happy to help you debug! To better assist you, please share:

1. The error message you're seeing
2. The relevant code snippet
3. What you expected to happen
4. Steps to reproduce the issue

Common debugging steps:
• Check the browser console for errors
• Verify prop types and data flow
• Use breakpoints or console.log statements
• Check network requests in DevTools`;
    }
    
    if (input.includes('typescript') || input.includes('types')) {
      return `TypeScript is great for catching errors early! Here are some common patterns:

\`\`\`typescript
// Interface for props
interface UserProps {
  id: number;
  name: string;
  email?: string; // optional
}

// Generic type
type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// Union types
type Theme = 'light' | 'dark' | 'auto';
\`\`\`

What specific TypeScript concept would you like help with?`;
    }
    
    return `I understand you're asking about "${userInput}". I'm here to help with your coding needs! Could you provide more details about what you're trying to accomplish?

Some things I can help with:
• Code generation and examples
• Debugging and troubleshooting
• Best practices and patterns
• Performance optimization
• Testing strategies

Feel free to share your code or describe your specific challenge!`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };  // Temporarily disabled - will be used for code extraction feature
  // const extractCodeBlocks = (content: string) => {
  //   const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  //   const blocks = [];
  //   let match;
  //   
  //   while ((match = codeBlockRegex.exec(content)) !== null) {
  //     blocks.push({
  //       language: match[1] || 'text',
  //       code: match[2].trim()
  //     });
  //   }
  //   
  //   return blocks;
  // };
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    
    return (
      <div key={message.id} className={`group mb-4 ${isUser ? 'ml-8' : 'mr-8'}`}>
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            {isUser ? (
              <>
                <AvatarImage src="" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="bg-blue-500 text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
            <div className={`inline-block max-w-full rounded-lg px-3 py-2 ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-muted border'
            }`}>
              <div className="text-sm whitespace-pre-wrap">
                {message.content.split(/(```[\s\S]*?```)/g).map((part, index) => {
                  if (part.startsWith('```') && part.endsWith('```')) {
                    const lines = part.split('\n');
                    const language = lines[0].replace('```', '') || 'text';
                    const code = lines.slice(1, -1).join('\n');
                    
                    return (
                      <div key={index} className="my-2">
                        <div className="bg-gray-900 text-gray-100 rounded-md">
                          <div className="flex items-center justify-between px-3 py-1 bg-gray-800 rounded-t-md">
                            <span className="text-xs text-gray-400">{language}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-gray-400 hover:text-white"
                                onClick={() => copyToClipboard(code)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {onCodeInsert && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-gray-400 hover:text-white"
                                  onClick={() => onCodeInsert(code)}
                                >
                                  Insert
                                </Button>
                              )}
                            </div>
                          </div>
                          <pre className="p-3 text-sm overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                        </div>
                      </div>
                    );
                  }
                  return part;
                })}
              </div>
            </div>
              <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
              isUser ? 'justify-end' : ''
            }`}>
              <span>{formatTimestamp(message.timestamp)}</span>
              
              {/* Show metadata for assistant messages */}
              {!isUser && message.metadata && (
                <div className="flex gap-1">
                  {message.metadata.contextLoaded && (
                    <span className="px-1 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-xs">
                      Context loaded
                    </span>
                  )}
                  {message.metadata.filesAnalyzed && message.metadata.filesAnalyzed > 0 && (
                    <span className="px-1 py-0.5 bg-blue-500/10 text-blue-600 rounded text-xs">
                      {message.metadata.filesAnalyzed} files
                    </span>
                  )}
                </div>
              )}
              
              {!isUser && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <ThumbsDown className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };  return (
    <div className="flex flex-col h-full border-r bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div><div className="flex gap-1">
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
      </div>      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="mr-8 mb-4">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted border rounded-lg px-3 py-2">
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
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>      {/* Input */}
      <div className="p-3 border-t bg-background flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask me anything about code..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
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
