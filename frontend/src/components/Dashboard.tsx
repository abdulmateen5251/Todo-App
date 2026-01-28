'use client';

import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ListTodo, LogOut } from 'lucide-react';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { TaskEditModal } from '@/components/TaskEditModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ToastContainer } from '@/components/Toast';
import { ChatInterface } from '@/components/ChatInterface';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/useToast';
import { Task, TaskCreateRequest, TaskUpdateRequest } from '@/types/task';

export function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id || '';

  const { tasks, loading, error, createTask, updateTask, toggleTask, deleteTask } = useTasks(userId);
  const { toasts, removeToast, success, error: showError } = useToast();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletedTask, setDeletedTask] = useState<{ task: Task; timeoutId: NodeJS.Timeout } | null>(null);
  const [activeView, setActiveView] = useState<'tasks' | 'chat'>('tasks');

  const handleCreateTask = async (data: TaskCreateRequest | TaskUpdateRequest) => {
    try {
      await createTask(data as TaskCreateRequest);
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
        title: task.title,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-surface/50 backdrop-blur-sm border border-border rounded-2xl p-4 h-fit sticky top-28">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-text-muted mb-3">Navigation</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveView('tasks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === 'tasks'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <ListTodo className="w-5 h-5" />
                <span className="font-medium">My Tasks</span>
              </button>
              
              <button
                onClick={() => setActiveView('chat')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === 'chat'
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </button>
            </nav>
          </div>

          <div className="border-t border-border pt-4 mt-auto">
            <div className="mb-4">
              <p className="text-xs text-text-muted mb-1">Signed in as</p>
              <p className="text-sm text-white font-medium truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-3xl">
          {activeView === 'tasks' ? (
            <>
              <header className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">My Tasks</h1>
                    <p className="text-text-muted text-sm md:hidden">{session?.user?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveView('chat')}
                      className="md:hidden px-4 py-2 text-sm font-medium text-text-muted bg-white/5 border border-border rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="md:hidden px-4 py-2 text-sm font-medium text-text-muted bg-white/5 border border-border rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
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
                  {loading && (
                    <>
                      <span>•</span>
                      <span className="text-primary animate-pulse">↻ refreshing...</span>
                    </>
                  )}
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
            </>
          ) : (
            <>
              <header className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Task Assistant</h1>
                    <p className="text-text-muted text-sm">Manage tasks with natural language</p>
                  </div>
                  <button
                    onClick={() => setActiveView('tasks')}
                    className="md:hidden px-4 py-2 text-sm font-medium text-text-muted bg-white/5 border border-border rounded-lg hover:bg-white/10 hover:border-white/20 hover:text-white transition-all"
                  >
                    <ListTodo className="w-5 h-5" />
                  </button>
                </div>
              </header>
              
              <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden h-[600px]">
                <ChatInterface />
              </div>
            </>
          )}
        </div>
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
