'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, MessageCircle, AlertTriangle } from 'lucide-react';

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

interface ChatSectionProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  currentProject?: {
    userId: string;
    pluginName: string;
  } | null;
}

export function ChatSection({ 
  messages, 
  onSendMessage, 
  onClearChat, 
  currentProject 
}: ChatSectionProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const message = inputValue.trim();
    setInputValue('');
    setIsTyping(true);
    
    try {
      await onSendMessage(message);
    } finally {
      setIsTyping(false);
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
    "What permissions does this use?",
    "Explain the code structure"
  ];

  const formatMarkdown = (text: string) => {
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-gray-100 p-3 rounded mt-2 mb-2 overflow-x-auto"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    handleSend();
  };

  return (
    <div className="mt-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              <Bot className="inline w-5 h-5 text-purple-500 mr-2" />
              AI Assistant
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentProject?.pluginName 
                  ? `Plugin: ${currentProject.pluginName}` 
                  : 'General Questions'
                }
              </span>
              <button
                onClick={onClearChat}
                className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                title="Clear chat history"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="h-64 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50 mb-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-8">
                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p>Ask me anything about your Minecraft plugin!</p>
                <p className="text-xs mt-1">
                  I can help with code explanations, troubleshooting, and Minecraft development questions.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${
                    message.type === 'user' ? 'justify-end' : 
                    message.type === 'error' ? 'justify-center' : 'justify-start'
                  }`}>
                    {message.type === 'user' && (
                      <div className="max-w-xs lg:max-w-md px-4 py-2 bg-indigo-600 text-white rounded-lg shadow">
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs text-indigo-200 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )}

                    {message.type === 'assistant' && (
                      <div className="max-w-none lg:max-w-4xl px-4 py-3 bg-gray-100 text-gray-900 rounded-lg shadow">
                        <div className="flex items-center mb-2">
                          <Bot className="w-4 h-4 text-purple-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">AI Assistant</span>
                          <div className="flex-1"></div>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div 
                          className="text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                        />
                        {message.metadata && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            {message.metadata.type && (
                              <span className="inline-flex items-center text-xs text-gray-500">
                                <span className={`w-2 h-2 rounded-full mr-1 ${
                                  message.metadata.type === 'info' ? 'bg-blue-500' : 'bg-orange-500'
                                }`}></span>
                                {message.metadata.type}
                              </span>
                            )}
                            {message.metadata.contextLoaded && (
                              <span className="inline-flex items-center text-xs text-green-600 ml-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                                Plugin context loaded
                              </span>
                            )}
                            {message.metadata.filesAnalyzed && message.metadata.filesAnalyzed > 0 && (
                              <span className="text-xs text-gray-500 ml-2">
                                {message.metadata.filesAnalyzed} files analyzed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {message.type === 'error' && (
                      <div className="max-w-xs lg:max-w-md px-4 py-2 bg-red-100 text-red-800 rounded-lg shadow border border-red-200">
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          <div className="text-sm">{message.content}</div>
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-xs lg:max-w-md px-4 py-3 bg-gray-100 text-gray-600 rounded-lg shadow">
                      <div className="flex items-center">
                        <Bot className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm">AI Assistant is thinking</span>
                        <div className="ml-2 flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                rows={2}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md resize-none"
                placeholder="Ask about your plugin, Minecraft development, or get help with your code..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </button>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">Quick questions:</div>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                  disabled={isTyping}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
