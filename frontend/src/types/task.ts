/**
 * TypeScript type definitions for Task API
 */

export interface Task {
  id: string;           // UUID or number
  user_id: string;      // UUID
  title: string;        // Task title (required)
  description?: string; // Task description (optional)
  status: string;       // pending, completed
  priority?: string;    // low, medium, high
  category?: string;    // Optional category
  completed: boolean;
  due_date?: string;    // ISO 8601 datetime or null
  completed_at?: string; // ISO 8601 datetime
  created_at: string;   // ISO 8601 datetime
  updated_at: string;   // ISO 8601 datetime
}

export interface TaskCreateRequest {
  title: string;        // Required task title
  description?: string; // Optional description
  priority?: string;    // Optional: low, medium, high
  category?: string;    // Optional category
  due_date?: string;    // Optional ISO 8601 datetime
}

export interface TaskUpdateRequest {
  title?: string;       // Optional title update
  description?: string; // Optional description update
  priority?: string;    // Optional priority update
  category?: string;    // Optional category update
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
