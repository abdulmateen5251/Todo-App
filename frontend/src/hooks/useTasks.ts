/**
 * React hook for task management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/task';
import { apiClient } from '@/services/api';

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

interface UseTasksReturn extends UseTasksState {
  createTask: (request: TaskCreateRequest) => Promise<Task>;
  updateTask: (taskId: string, request: TaskUpdateRequest) => Promise<Task>;
  toggleTask: (taskId: string) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useTasks(userId?: string): UseTasksReturn {
  const [state, setState] = useState<UseTasksState>({
    tasks: [],
    loading: false,
    error: null,
  });

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const tasks = await apiClient.listTasks(userId);
      setState((prev) => ({ ...prev, tasks, loading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        loading: false,
      }));
    }
  }, [userId]);

  // Create a new task
  const createTask = useCallback(
    async (request: TaskCreateRequest) => {
      if (!userId) throw new Error('Not authenticated');

      try {
        const newTask = await apiClient.createTask(userId, request);
        setState((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
        return newTask;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to create task');
        setState((prev) => ({ ...prev, error: err.message }));
        throw err;
      }
    },
    [userId]
  );

  // Update a task
  const updateTask = useCallback(
    async (taskId: string, request: TaskUpdateRequest) => {
      if (!userId) throw new Error('Not authenticated');

      try {
        const updated = await apiClient.updateTask(userId, taskId, request);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        }));
        return updated;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to update task');
        setState((prev) => ({ ...prev, error: err.message }));
        throw err;
      }
    },
    [userId]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    async (taskId: string) => {
      if (!userId) throw new Error('Not authenticated');

      // Find current task to get its completion status
      const currentTask = state.tasks.find(t => t.id === taskId);
      if (!currentTask) throw new Error('Task not found');

      try {
        const updated = await apiClient.completeTask(userId, taskId, !currentTask.completed);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        }));
        return updated;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to toggle task');
        setState((prev) => ({ ...prev, error: err.message }));
        throw err;
      }
    },
    [userId, state.tasks]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!userId) throw new Error('Not authenticated');

      try {
        await apiClient.deleteTask(userId, taskId);
        setState((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
        }));
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to delete task');
        setState((prev) => ({ ...prev, error: err.message }));
        throw err;
      }
    },
    [userId]
  );

  // Load tasks on mount or when userId changes
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
