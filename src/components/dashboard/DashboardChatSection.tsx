'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Trash2, Loader2 } from 'lucide-react';

interface Message {
  type: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: string;
    contextLoaded?: boolean;
    filesAnalyzed?: number;
  };
}

interface DashboardChatSectionProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  currentProject?: {
    userId: string;
    pluginName: string;
  } | null;
  isLoading?: boolean;
}

export function DashboardChatSection({ 
  messages, 
  onSendMessage, 
  onClearChat
}: DashboardChatSectionProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const message = inputValue.trim();
    setInputValue('');
    setIsSending(true);
    
    try {
      await onSendMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How does this plugin work?",
    "What are the main features?",
    "How do I configure this?",
    "What permissions does this use?"
  ];

  const formatMarkdown = (text: string) => {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded mt-2 mb-2 overflow-x-auto text-sm"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
  };  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Chat Messages - Enhanced scrollability */}
      <ScrollArea className="flex-1 pr-2 min-h-0">
        <div className="space-y-4 p-3">          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="p-3 bg-muted/30 rounded-xl w-fit mx-auto mb-3">
                <Bot className="h-10 w-10 opacity-50" />
              </div>
              <p className="text-sm font-medium mb-1">Ask me anything about plugin development!</p>
              <p className="text-xs">I can help with code, troubleshooting, and best practices.</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`flex ${
                  message.type === 'user' ? 'justify-end' : 
                  message.type === 'error' ? 'justify-center' : 'justify-start'
                }`}>                  {message.type === 'user' && (
                    <div className="bg-primary text-primary-foreground px-3 py-2 rounded-xl max-w-[85%] shadow-md">
                      <div className="text-sm break-words">{message.content}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}

                  {message.type === 'assistant' && (
                    <div className="bg-muted/40 px-3 py-2 rounded-xl max-w-[90%] border border-muted/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">AI Assistant</span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div 
                        className="text-sm prose prose-sm max-w-none dark:prose-invert break-words leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                      />
                      {message.metadata && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.metadata.contextLoaded && (
                            <Badge variant="secondary" className="text-xs h-5 rounded-md bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              Context loaded
                            </Badge>
                          )}
                          {message.metadata.filesAnalyzed && message.metadata.filesAnalyzed > 0 && (
                            <Badge variant="outline" className="text-xs h-5 rounded-md border-0 bg-primary/10 text-primary">
                              {message.metadata.filesAnalyzed} files
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {message.type === 'error' && (
                    <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-xl border border-destructive/20 max-w-[85%]">
                      <div className="text-sm break-words">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
                {isSending && (
                <div className="flex justify-start">
                  <div className="bg-muted/40 px-3 py-2 rounded-xl border border-muted/50">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span className="text-sm">Thinking...</span>
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>      {/* Quick Questions */}
      {messages.length === 0 && (
        <div className="py-3 border-t border-muted/50">
          <div className="text-xs font-medium text-muted-foreground mb-2">Quick questions:</div>
          <div className="flex flex-wrap gap-1">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputValue(question);
                  handleSend();
                }}
                className="text-xs h-7 rounded-lg border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
                disabled={isSending}
              >
                {question.split(' ').slice(0, 3).join(' ')}...
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="flex gap-2 pt-3 border-t border-muted/50">
        <Input
          placeholder="Ask about your plugin or development questions..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className="flex-1 h-10 border-0 bg-muted/30 focus:bg-muted/50 transition-all duration-200 rounded-lg"
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          size="sm"
          className="h-10 px-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        {messages.length > 0 && (
          <Button
            onClick={onClearChat}
            variant="outline"
            size="sm"
            disabled={isSending}
            className="h-10 px-3 rounded-lg border-0 bg-muted/30 hover:bg-muted/60 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
