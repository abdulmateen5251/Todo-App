/**
 * Event-based system for cross-component communication
 * Allows components to emit and listen to custom events
 */

type EventCallback = (data?: any) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks && callbacks.length > 0) {
      console.log(`🎯 EventBus: Emitting '${event}' to ${callbacks.length} listener(s)`);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ EventBus: Error in listener for '${event}':`, error);
        }
      });
    } else {
      console.warn(`⚠️ EventBus: No listeners for event '${event}'`);
    }
  }

  /**
   * Clear all event listeners
   */
  clear(): void {
    this.events.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Expose to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).eventBus = eventBus;
  console.log('🔧 EventBus attached to window for debugging');
}

// Event names
export const EVENTS = {
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_TOGGLED: 'task:toggled',
  TASKS_REFRESH: 'tasks:refresh',
} as const;
