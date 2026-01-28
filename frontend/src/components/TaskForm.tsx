// Task creation and editing form
'use client';

import { useState, FormEvent } from 'react';
import { TaskCreateRequest, TaskUpdateRequest } from '@/types/task';

interface TaskFormProps {
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => void | Promise<void>;
  initialData?: {
    title?: string;
    description?: string;
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
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(initialData?.due_date || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Task title cannot be empty');
      return;
    }

    if (trimmedTitle.length > 500) {
      setError('Task title must be 500 characters or less');
      return;
    }

    // Submit data
    const data: TaskCreateRequest | TaskUpdateRequest = {
      title: trimmedTitle,
    };
    
    // Add optional fields
    if (description.trim()) {
      data.description = description.trim();
    }
    
    if (dueDate) {
      data.due_date = `${dueDate}T00:00:00`;
    }
    
    onSubmit(data);

    // Reset form if creating new task
    if (!initialData) {
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-4 rounded-xl border border-border backdrop-blur-sm shadow-lg">
      {/* Title input */}
      <div>
        <label htmlFor="title" className="sr-only">
          Task title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 text-sm bg-background border border-border text-text placeholder:text-text-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
          maxLength={500}
          autoFocus={!initialData}
        />
        <div className="mt-1 flex justify-between items-center text-xs">
          <span className="text-text-muted">{title.length}/500</span>
          {error && (
            <p className="text-xs text-red-500 font-bold animate-pulse">{error}</p>
          )}
        </div>
      </div>

      {/* Description input (optional) */}
      <div>
        <label htmlFor="description" className="block text-xs font-medium text-text-muted mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          rows={3}
          className="w-full px-4 py-2 text-sm bg-background border border-border text-text placeholder:text-text-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner resize-none"
          maxLength={5000}
        />
        <div className="mt-1 text-xs text-right text-text-muted">
          {description.length}/5000
        </div>
      </div>

      {/* Due date input */}
      <div>
        <label htmlFor="due-date" className="block text-xs font-medium text-text-muted mb-1">
          Due date (optional)
        </label>
        <input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-2 text-sm bg-background border border-border text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all dark:[color-scheme:dark]"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
        >
          {submitLabel}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-muted bg-white/5 border border-border rounded-lg hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
