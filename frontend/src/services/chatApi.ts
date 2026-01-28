/**
 * Chat API service for sending messages to the task management backend.
 */

import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ToolCall {
  id: string;
  name: string;
  arguments: any;
}

interface ToolResult {
  id: string;
  result: any;
}

interface ChatResponse {
  message: string;
  tool_calls?: ToolCall[];
  tool_results?: ToolResult[];
}

/**
 * Send a chat message to the backend and receive AI response.
 * 
 * @param message - User's message content
 * @returns AI assistant response
 * @throws Error if request fails or authentication is invalid
 */
export async function sendChatMessage(message: string): Promise<ChatResponse> {
  // Get authentication token from NextAuth session
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('You must be logged in to use the chat interface');
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication expired. Please log in again.');
    }
    
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    if (response.status === 504) {
      throw new Error('Request timed out. Please try again.');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to send message');
  }

  return response.json();
}
