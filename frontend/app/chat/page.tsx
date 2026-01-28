/**
 * Chat page - Conversational task management interface.
 */
import { AuthGuard } from '@/components/AuthGuard';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatProvider>
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Task Assistant
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your tasks using natural language
              </p>
            </div>
          </header>

          <main className="flex-1 overflow-hidden p-4">
            <ChatInterface />
          </main>
        </div>
      </ChatProvider>
    </AuthGuard>
  );
}
