/**
 * ChatInterface component for conversational task management.
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Bot, User, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '@/services/chatApi';
import { useChatContext } from '@/contexts/ChatContext';
import { eventBus, EVENTS } from '@/lib/eventBus';

export function ChatInterface() {
  const { data: session, status } = useSession();
  const { messages, addMessage, setMessages } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is authenticated
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-pulse text-neutral-tan">Loading chat...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
        <AlertCircle className="w-12 h-12 text-yellow-500" />
        <p className="text-neutral-tan text-center">
          You must be logged in to use the chat interface
        </p>
        <p className="text-sm text-neutral-tan/60">
          Please refresh the page or sign in again
        </p>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = input.trim();
    if (!content || isLoading) return;

    // Add user message immediately
    const userMessage = { role: 'user' as const, content };
    addMessage(userMessage);
    setInput('');
    
    setIsLoading(true);
    
    try {
      // Send to backend API
      const response = await sendChatMessage(content);
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.message
      };
      
      addMessage(assistantMessage);
      
      // Check if task was created/modified - emit event to refresh dashboard
      if (response.tool_calls && response.tool_calls.length > 0) {
        const toolNames = response.tool_calls.map(tc => tc.name);
        console.log('🔧 Tool calls detected:', toolNames);
        
        const taskModifyingTools = ['add_task', 'update_task', 'complete_task', 'delete_task'];
        const hasTaskChange = toolNames.some(name => taskModifyingTools.includes(name));
        
        if (hasTaskChange) {
          console.log('📤 Emitting TASKS_REFRESH event...');
          // Small delay to ensure backend has completed
          setTimeout(() => {
            eventBus.emit(EVENTS.TASKS_REFRESH);
            console.log('✅ Event emitted!');
          }, 100);
        }
      } else {
        console.log('ℹ️ No tool calls in response');
      }
    } catch (error) {
      // Show error message
      const errorMessage = {
        role: 'assistant' as const,
        content: error instanceof Error 
          ? error.message 
          : 'Sorry, I encountered an error. Please try again.'
      };
      
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Task Assistant</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by GPT-4</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Bot className="w-12 h-12 text-primary" />
              </div>
            </div>
            <p className="text-lg font-medium mb-2">Welcome to Task Manager Chat</p>
            <p className="text-sm">Ask me to create a task, show your tasks, or mark tasks complete...</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mt-1">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-2 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
