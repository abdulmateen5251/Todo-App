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
  console.log('🚀 [CHAT API] Sending message:', message.substring(0, 100));
  console.log('📍 [CHAT API] API URL:', API_BASE_URL);
  
  // Get authentication token from NextAuth session
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('❌ [CHAT API] No auth token found in localStorage');
    throw new Error('You must be logged in to use the chat interface');
  }
  
  console.log('✅ [CHAT API] Auth token exists:', token.substring(0, 20) + '...');

  const requestPayload = { message };
  console.log('📦 [CHAT API] Request payload:', requestPayload);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestPayload),
    });

    console.log('📥 [CHAT API] Response status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ [CHAT API] Request failed with status:', response.status);
      
      if (response.status === 401) {
        console.error('🔒 [CHAT API] Authentication expired');
        throw new Error('Authentication expired. Please log in again.');
      }
      
      if (response.status === 429) {
        console.error('⏳ [CHAT API] Rate limited');
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      if (response.status === 504) {
        console.error('⏱️ [CHAT API] Request timeout');
        throw new Error('Request timed out. Please try again.');
      }

      const errorData = await response.json().catch(() => ({}));
      console.error('💥 [CHAT API] Error response:', errorData);
      throw new Error(errorData.detail || errorData.error?.message || 'Failed to send message');
    }

    const data = await response.json();
    console.log('✅ [CHAT API] Success! Response:', data);
    console.log('💬 [CHAT API] Message:', data.message);
    if (data.tool_calls) {
      console.log('🔧 [CHAT API] Tool calls:', data.tool_calls);
    }
    if (data.tool_results) {
      console.log('📊 [CHAT API] Tool results:', data.tool_results);
    }
    
    return data;
  } catch (error) {
    console.error('💥 [CHAT API] Fetch error:', error);
    throw error;
  }
}
