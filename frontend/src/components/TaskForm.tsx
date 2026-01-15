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
    <form onSubmit={handleSubmit} className="space-y-4 bg-card p-4 rounded-xl border border-border backdrop-blur-sm shadow-lg">
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
          className="w-full px-4 py-3 text-sm bg-background border border-border text-text placeholder:text-text-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
          maxLength={200}
          autoFocus={!initialData}
        />
        <div className="mt-1 flex justify-between items-center">
          {error ? (
            <p className="text-xs text-primary-light font-bold animate-pulse">{error}</p>
          ) : <span></span>}
          <p className="text-xs text-text-muted">
            {description.length}/200
          </p>
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
