/**
 * TypeScript type definitions for Task API
 */

export interface Task {
  id: string;           // UUID
  user_id: string;      // UUID
  description: string;
  completed: boolean;
  due_date?: string;    // ISO 8601 datetime or null
  created_at: string;   // ISO 8601 datetime
  updated_at: string;   // ISO 8601 datetime
}

export interface TaskCreateRequest {
  description: string;
  due_date?: string;    // Optional ISO 8601 datetime
}

export interface TaskUpdateRequest {
  description?: string;
  due_date?: string | null;  // null to clear due date
}

export interface TaskCompleteRequest {
  completed: boolean;
}

export interface PaginatedResponse {
  total: number;
  limit: number;
  offset: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  pagination?: PaginatedResponse;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  status: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
