// Task list component with filtering
'use client';

import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { TaskSkeleton } from './TaskSkeleton';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  filter?: 'all' | 'active' | 'completed';
}

export function TaskList({ 
  tasks, 
  loading, 
  error, 
  onToggle, 
  onDelete, 
  onEdit,
  filter = 'all' 
}: TaskListProps) {
  // Filter tasks based on completion status
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Loading state
  if (loading) {
    return <TaskSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md px-6 py-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading tasks</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredTasks.length === 0) {
    const emptyMessage = {
      all: 'No tasks yet. Create one to get started!',
      active: 'No active tasks. All done! 🎉',
      completed: 'No completed tasks yet.'
    }[filter];

    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="mx-auto w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <p className="mt-4 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Task list
  return (
    <div className="space-y-2">
      {filteredTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
      
      {/* Task count */}
      <div className="pt-2 text-center">
        <p className="text-xs text-gray-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          {filter !== 'all' && ` (${tasks.length} total)`}
        </p>
      </div>
    </div>
  );
}
