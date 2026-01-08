# Frontend API Client Contract

**Purpose**: Defines the TypeScript interface for frontend → backend communication  
**Language**: TypeScript  
**Framework**: Next.js 16+ with React hooks

---

## API Client Type Definitions

```typescript
// types/api.ts

export interface Task {
  id: string;           // UUID
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
    code: string;                           // e.g., "VALIDATION_ERROR"
    message: string;
    details?: Record<string, string>;      // Field-level errors
  };
  status: number;
}
```

---

## API Client Functions

```typescript
// services/api.ts

import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: RequestInit & { body?: unknown }
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Add auth token from session (populated by Better Auth)
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      ...options,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;  // Will be caught by error boundary
    }

    if (response.status === 204) {
      return null as T;  // No content
    }

    const data = await response.json();
    return data.data as T;
  }

  private async getAuthToken(): Promise<string | null> {
    // Retrieve token from Better Auth session
    // Implementation depends on Better Auth setup
    try {
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      return session?.token || null;
    } catch {
      return null;
    }
  }

  // Task endpoints

  async listTasks(userId: string, options?: { completed?: boolean; limit?: number; offset?: number }): Promise<Task[]> {
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
    return this.request<Task>('PATCH', `/api/${userId}/tasks/${taskId}/complete`, {
      body: { completed },
    });
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    return this.request<void>('DELETE', `/api/${userId}/tasks/${taskId}`);
  }
}

export const apiClient = new ApiClient();
```

---

## React Hook: useTasks

```typescript
// hooks/useTasks.ts

import { useState, useCallback, useEffect } from 'react';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/api';
import { apiClient } from '@/services/api';
import { useSession } from 'next-auth/react';

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
}

export function useTasks() {
  const { data: session } = useSession();
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: false,
    error: null,
  });

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const tasks = await apiClient.listTasks(session.user.id);
      setState((prev) => ({ ...prev, tasks, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch tasks'),
        loading: false,
      }));
    }
  }, [session?.user?.id]);

  // Create a new task
  const createTask = useCallback(
    async (request: TaskCreateRequest) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      try {
        const newTask = await apiClient.createTask(session.user.id, request);
        setState((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
        return newTask;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to create task'),
        }));
        throw error;
      }
    },
    [session?.user?.id]
  );

  // Update a task
  const updateTask = useCallback(
    async (taskId: string, request: TaskUpdateRequest) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      try {
        const updated = await apiClient.updateTask(session.user.id, taskId, request);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        }));
        return updated;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to update task'),
        }));
        throw error;
      }
    },
    [session?.user?.id]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      try {
        const updated = await apiClient.completeTask(session.user.id, taskId, !completed);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        }));
        return updated;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to toggle task'),
        }));
        throw error;
      }
    },
    [session?.user?.id]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!session?.user?.id) throw new Error('Not authenticated');

      try {
        await apiClient.deleteTask(session.user.id, taskId);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to delete task'),
        }));
        throw error;
      }
    },
    [session?.user?.id]
  );

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    ...state,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
```

---

## Error Handling in React Components

```typescript
// components/ErrorBoundary.tsx

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!) || (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

---

## Usage in Components

```typescript
// components/TaskList.tsx

import { useTasks } from '@/hooks/useTasks';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

export function TaskList() {
  const { tasks, loading, error, createTask, toggleTask, deleteTask } = useTasks();

  if (loading) return <div className="text-center py-4">Loading tasks...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error.message}</div>;

  return (
    <div className="space-y-4">
      <TaskForm onSubmit={createTask} />
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet. Create one to get started!</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id, task.completed)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Summary

This contract defines:
- **TypeScript types** for all API entities and requests.
- **API client class** with methods for all CRUD operations.
- **React hook** (`useTasks`) for state management and API integration.
- **Error handling** with error boundaries and try-catch patterns.
- **Session integration** with Better Auth for authentication.

The frontend communicates exclusively through these interfaces, ensuring:
- **Type safety**: All API calls are validated at compile time.
- **Consistency**: All endpoints use the same error handling pattern.
- **Maintainability**: Centralized API logic in services and hooks.
