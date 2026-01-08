'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { TaskEditModal } from '@/components/TaskEditModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ToastContainer } from '@/components/Toast';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/task';

/**
 * Get or create a development user ID.
 * TODO: Replace with actual NextAuth session user ID in Phase 4
 */
function getDevUserId(): string {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('dev_user_id');
    if (!userId) {
      // Generate a random UUID for development testing
      userId = crypto.randomUUID();
      localStorage.setItem('dev_user_id', userId);
      console.log('[DEV] Created new user ID:', userId);
    }
    return userId;
  }
  return '';
}

export default function Home() {
  const [userId, setUserId] = useState<string>('');
  
  // Initialize user ID on client side
  useEffect(() => {
    setUserId(getDevUserId());
  }, []);
  
  const { tasks, loading, error, createTask, updateTask, toggleTask, deleteTask } = useTasks(userId);
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletedTask, setDeletedTask] = useState<{ task: Task; timeoutId: NodeJS.Timeout } | null>(null);

  const handleCreateTask = async (data: TaskCreateRequest | TaskUpdateRequest) => {
    try {
      // For creation, description is required
      const createData: TaskCreateRequest = {
        description: data.description!,
        due_date: data.due_date || undefined,
      };
      await createTask(createData);
      setShowForm(false);
      success('Task created successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleSaveEdit = async (taskId: string, data: TaskUpdateRequest) => {
    try {
      await updateTask(taskId, data);
      setEditingTask(null);
      success('Task updated successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update task');
      throw err; // Re-throw to prevent modal from closing
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(taskId);
      const task = tasks.find(t => t.id === taskId);
      success(task?.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;

    const taskToDelete = tasks.find(t => t.id === deletingTaskId);
    
    try {
      await deleteTask(deletingTaskId);
      setDeletingTaskId(null);

      // Show undo option for 5 seconds
      if (taskToDelete) {
        const timeoutId = setTimeout(() => {
          setDeletedTask(null);
        }, 5000);

        setDeletedTask({ task: taskToDelete, timeoutId });
        
        success('Task deleted', {
          label: 'Undo',
          onClick: () => handleUndoDelete(taskToDelete, timeoutId),
        });
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete task');
      setDeletingTaskId(null);
    }
  };

  const handleUndoDelete = async (task: Task, timeoutId: NodeJS.Timeout) => {
    clearTimeout(timeoutId);
    setDeletedTask(null);

    try {
      await createTask({
        description: task.description,
        due_date: task.due_date,
      });
      success('Task restored');
    } catch (err) {
      showError('Failed to restore task');
    }
  };

  const handleCancelDelete = () => {
    setDeletingTaskId(null);
  };

  // Calculate statistics
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };
  
  // Don't render until we have a user ID
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Tasks</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label={showForm ? 'Close form' : 'Add task'}
            >
              {showForm ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                  Close
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Add Task
                </span>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span>{stats.total} total</span>
            <span className="hidden sm:inline">•</span>
            <span>{stats.active} active</span>
            <span className="hidden sm:inline">•</span>
            <span>{stats.completed} completed</span>
          </div>
        </header>

        {/* Task form (conditionally shown) */}
        {showForm && (
          <div className="mb-4 sm:mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <TaskForm 
              onSubmit={handleCreateTask}
              submitLabel="Add Task"
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
                filter === f
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task list */}
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onToggle={handleToggleTask}
          onDelete={handleDeleteClick}
          onEdit={handleEditTask}
          filter={filter}
        />
      </div>

      {/* Edit modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {/* Delete confirmation */}
      {deletingTaskId && (
        <ConfirmDialog
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

