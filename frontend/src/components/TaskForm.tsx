// Task creation and editing form
'use client';

import { useState, FormEvent } from 'react';
import { TaskCreateRequest, TaskUpdateRequest } from '@/types/task';

interface TaskFormProps {
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => void | Promise<void>;
  initialData?: {
    description: string;
    due_date?: string | null;
  };
  submitLabel?: string;
  onCancel?: () => void;
}

export function TaskForm({ 
  onSubmit, 
  initialData, 
  submitLabel = 'Add Task',
  onCancel 
}: TaskFormProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

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

    // Submit data
    const data: TaskCreateRequest | TaskUpdateRequest = {
      description: trimmed,
    };
    
    // Only include due_date if it has a value
    // Convert from YYYY-MM-DD to ISO 8601 datetime format
    if (dueDate) {
      data.due_date = `${dueDate}T00:00:00`;
    }
    
    onSubmit(data);

    // Reset form if creating new task
    if (!initialData) {
      setDescription('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Description input */}
      <div>
        <label htmlFor="description" className="sr-only">
          Task description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <label htmlFor="due-date" className="block text-xs font-medium text-gray-700 mb-1">
          Due date (optional)
        </label>
        <input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {submitLabel}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
