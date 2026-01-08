// Task edit modal component
'use client';

import { useState, useEffect } from 'react';
import { Task, TaskUpdateRequest } from '@/types/task';

interface TaskEditModalProps {
  task: Task;
  onSave: (taskId: string, data: TaskUpdateRequest) => Promise<void>;
  onCancel: () => void;
}

export function TaskEditModal({ task, onSave, onCancel }: TaskEditModalProps) {
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [originalUpdatedAt] = useState(task.updated_at);

  // Update form if task changes
  useEffect(() => {
    setDescription(task.description);
    setDueDate(task.due_date || '');
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for conflicts (if task was updated elsewhere)
    if (task.updated_at !== originalUpdatedAt) {
      setError('This task was updated elsewhere. Please refresh and try again.');
      return;
    }

    // Validation
    const trimmed = description.trim();
    if (!trimmed) {
      setError('Task description cannot be empty');
      return;
    }

    if (trimmed.length > 200) {
      setError('Task description must be 200 characters or less');
      return;
    }

    // Save changes
    setSaving(true);
    try {
      await onSave(task.id, {
        description: trimmed,
        due_date: dueDate ? `${dueDate}T00:00:00` : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Description input */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={200}
              autoFocus
            />
            <div className="mt-1 flex justify-between items-center">
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <p className="text-xs text-gray-400 ml-auto">
                {description.length}/200
              </p>
            </div>
          </div>

          {/* Due date input */}
          <div>
            <label htmlFor="edit-due-date" className="block text-sm font-medium text-gray-700 mb-1">
              Due date
            </label>
            <input
              id="edit-due-date"
              type="date"
              value={dueDate ? dueDate.split('T')[0] : ''}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="mt-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear due date
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
