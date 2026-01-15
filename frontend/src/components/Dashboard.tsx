'use client';

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { TaskEditModal } from '@/components/TaskEditModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ToastContainer } from '@/components/Toast';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/task';

export function Dashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  const { tasks, loading, error, createTask, updateTask, toggleTask, deleteTask } = useTasks(userId);
  const { toasts, removeToast, success, error: showError } = useToast();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletedTask, setDeletedTask] = useState<{ task: Task; timeoutId: NodeJS.Timeout } | null>(null);

  const handleCreateTask = async (data: TaskCreateRequest | TaskUpdateRequest) => {
    try {
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
      throw err;
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

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="pt-24 pb-20 sm:pt-28 sm:pb-32 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">My Tasks</h1>
              <p className="text-text-muted text-sm">{session?.user?.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 text-sm font-medium text-text-muted bg-white/5 border border-border rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
              >
                Sign Out
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                aria-label={showForm ? 'Close form' : 'Add task'}
              >
                {showForm ? 'Close' : 'Add Task'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-text-muted">
            <span>{stats.total} total</span>
            <span>•</span>
            <span>{stats.active} active</span>
            <span>•</span>
            <span>{stats.completed} completed</span>
          </div>
        </header>

        {showForm && (
          <div className="mb-4 sm:mb-6">
            <TaskForm
              onSubmit={handleCreateTask}
              submitLabel="Add Task"
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        <div className="mb-4 flex gap-1 sm:gap-2 border-b border-border overflow-x-auto">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
                filter === f
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-white hover:border-white/20'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

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

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {deletingTaskId && (
        <ConfirmDialog
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTaskId(null)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
