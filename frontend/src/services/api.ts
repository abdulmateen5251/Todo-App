/**
 * API client for backend communication
 */

import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://abdulmateen5251-phase-2.hf.space';

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (network errors, 5xx, timeouts)
 */
function isRetryableError(error: unknown): boolean {
  const err = error as {response?: {status?: number}; status?: number};
  if (!err.response) return true; // Network error
  const status = err.status || err.response?.status;
  return typeof status === 'number' && status >= 500 && status < 600; // Server errors
}

class ApiClient {
  private baseUrl: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // Start with 1 second

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: Omit<RequestInit, 'body'> & { body?: unknown }
  ): Promise<T> {
    return this.requestWithRetry<T>(method, path, options, 0);
  }

  private async requestWithRetry<T>(
    method: string,
    path: string,
    options?: Omit<RequestInit, 'body'> & { body?: unknown },
    attempt: number = 0
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers as Record<string, string>,
    };

    // Add auth token from session
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        ...options,
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        // TODO: Trigger re-authentication flow
        // For now, clear any stored token and throw error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dev_token');
        }
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Extract error message from various response formats
        let errorMessage = `Request failed with status ${response.status}`;
        
        if (errorData.detail) {
          // FastAPI validation errors
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: {loc?: string[]; msg: string}) => 
              `${err.loc?.join('.') || 'field'}: ${err.msg}`
            ).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.detail.message) {
            errorMessage = errorData.detail.message;
          }
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        const error = new Error(errorMessage) as Error & {status: number; response: Response; data: unknown};
        error.status = response.status;
        error.response = response;
        error.data = errorData;
        throw error;
      }

      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();
      
      // Transform backend task response to match frontend Task interface
      // Backend returns: { status: "completed" | "pending" }
      // Frontend expects: { completed: boolean }
      if (this.isTaskResponse(data)) {
        const transformed = this.transformTask(data);
        console.log('🔄 Single task transformed:', { original: data.status, completed: transformed.completed });
        return transformed as T;
      }
      
      // Transform array of tasks
      if (Array.isArray(data)) {
        if (data.length > 0 && this.isTaskResponse(data[0])) {
          const transformed = data.map(task => this.transformTask(task));
          console.log('🔄 Task array transformed:', transformed.length, 'tasks');
          return transformed as T;
        }
        // Return empty array as-is
        return data as T;
      }
      
      return data as T;

    } catch (error: unknown) {
      // Retry logic for retryable errors
      if (isRetryableError(error) && attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
        await sleep(delay);
        return this.requestWithRetry<T>(method, path, options, attempt + 1);
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API request failed:', error);
      }

      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    /**
     * Retrieve JWT token for backend API authentication
     * Token is stored in localStorage during signin/signup
     */
    if (typeof window === 'undefined') {
      return null; // Server-side rendering
    }
    
    // Get token from localStorage (set during signin/signup)
    const token = localStorage.getItem('auth_token');
    return token;
  }

  /**
   * Check if response data is a task object
   */
  private isTaskResponse(data: any): boolean {
    return data && typeof data === 'object' && 'status' in data && 'user_id' in data;
  }

  /**
   * Transform backend task to frontend Task interface
   * Backend: { status: "completed" | "pending" }
   * Frontend: { completed: boolean }
   */
  private transformTask(task: any): any {
    return {
      ...task,
      completed: task.status === 'completed'
    };
  }

  // Task endpoints

  async listTasks(
    userId: string,
    options?: { completed?: boolean; limit?: number; offset?: number }
  ): Promise<Task[]> {
    const params = new URLSearchParams();
    if (options?.completed !== undefined) params.set('completed', String(options.completed));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.offset) params.set('offset', String(options.offset));

    const query = params.toString();
    const path = `/api/${userId}/tasks${query ? `?${query}` : ''}`;
    return this.request<Task[]>('GET', path);
  }

  async getTask(userId: string, taskId: string): Promise<Task> {
    return this.request<Task>('GET', `/api/${userId}/tasks/${taskId}`);
  }

  async createTask(userId: string, request: TaskCreateRequest): Promise<Task> {
    return this.request<Task>('POST', `/api/${userId}/tasks`, { body: request });
  }

  async updateTask(userId: string, taskId: string, request: TaskUpdateRequest): Promise<Task> {
    return this.request<Task>('PUT', `/api/${userId}/tasks/${taskId}`, { body: request });
  }

  async completeTask(userId: string, taskId: string, completed: boolean): Promise<Task> {
    // Backend toggle endpoint doesn't need body - it just toggles the current state
    return this.request<Task>('PATCH', `/api/${userId}/tasks/${taskId}/complete`);
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/${userId}/tasks/${taskId}`);
  }
}

export const apiClient = new ApiClient();
