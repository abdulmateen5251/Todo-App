/**
 * Chat context for persisting chat messages across component mounts
 */
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessagesState] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessagesState(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessagesState([]);
  }, []);

  const setMessages = useCallback((newMessages: Message[]) => {
    setMessagesState(newMessages);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}
