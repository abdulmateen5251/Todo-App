// Task list item component
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
    });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !task.completed;
  };

  return (
    <div className="group flex items-start gap-3 p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 mt-0.5 min-w-[44px] min-h-[44px] flex items-center justify-center sm:min-w-0 sm:min-h-0"
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          task.completed 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 hover:border-blue-400'
        }`}>
          {task.completed && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
          {task.description}
        </p>
        
        {task.due_date && (
          <p className={`text-xs mt-1 ${
            isOverdue(task.due_date) 
              ? 'text-red-600 font-medium' 
              : task.completed 
                ? 'text-gray-400' 
                : 'text-gray-500'
          }`}>
            {isOverdue(task.due_date) && '⚠️ '}
            Due {formatDate(task.due_date)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-2.5 sm:p-1.5 text-gray-400 hover:text-blue-600 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label="Edit task"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
        )}
        
        <button
          onClick={() => onDelete(task.id)}
          className="p-2.5 sm:p-1.5 text-gray-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
          aria-label="Delete task"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
