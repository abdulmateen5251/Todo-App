// Skeleton loader for task list
export function TaskSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
          <div className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded border-2 border-gray-300 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-gray-200 rounded" />
            <div className="w-6 h-6 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
