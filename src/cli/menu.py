"""
CLI menu and user interaction functions.

This module provides the main menu and user input/flow functions.
"""
from src.services.todo_service import TodoService
from src.cli.display import format_todo_list, format_empty_list


def display_main_menu() -> None:
    """Display the main menu."""
    print()
    print("=" * 43)
    print(" " * 12 + "📝 Todo Application")
    print("=" * 43)
    print()
    print("What would you like to do?")
    print()
    print("  1. Add a new todo")
    print("  2. View all todos")
    print("  3. Update a todo")
    print("  4. Delete a todo")
    print("  5. Mark todo as complete")
    print("  6. Exit")
    print()
    print("=" * 43)


def get_user_choice() -> str:
    """
    Get user's menu choice with validation.
    
    Returns:
        User's choice as a string (1-6)
    """
    while True:
        choice = input("Enter your choice (1-6): ").strip()
        
        # Validate choice
        if choice in ["1", "2", "3", "4", "5", "6"]:
            return choice
        
        print("✗ Invalid choice. Please enter a number between 1 and 6.")


def add_todo_flow(service: TodoService) -> None:
    """
    Handle the add todo workflow.
    
    Args:
        service: TodoService instance
    """
    print()
    print("--- Add New Todo ---")
    
    while True:
        description = input("Enter todo description (max 200 characters): ").strip()
        
        try:
            todo = service.add_todo(description)
            print()
            print("✓ Todo added successfully!")
            print(f"  ID: {todo.id}")
            print(f"  Description: {todo.description}")
            print(f"  Status: Pending")
            print()
            break
        except ValueError as e:
            print(f"✗ Error: {e}")
            continue
    
    input("Press Enter to continue...")


def view_todos_flow(service: TodoService) -> None:
    """
    Handle the view todos workflow.
    
    Args:
        service: TodoService instance
    """
    print()
    
    todos = service.get_all_todos()
    counts = service.get_counts()
    
    if todos:
        print(format_todo_list(todos, counts))
    else:
        print(format_empty_list(counts))
    
    print()
    input("Press Enter to continue...")


def exit_flow() -> None:
    """Handle the exit workflow with goodbye message."""
    print()
    print("=" * 43)
    print("     Thank you for using Todo App!")
    print("     All todos are stored in memory.")
    print("     Your todos will be lost when you exit.")
    print("=" * 43)
    print()
    print("Goodbye! 👋")
    print()


def mark_complete_flow(service: TodoService) -> None:
    """
    Handle the mark complete workflow.
    
    Args:
        service: TodoService instance
    """
    print()
    print("--- Mark Todo as Complete ---")
    
    try:
        todo_id_str = input("Enter todo ID to mark complete: ").strip()
        
        # Convert to int
        try:
            todo_id = int(todo_id_str)
        except ValueError:
            print("✗ Error: Please enter a valid number.")
            print()
            input("Press Enter to continue...")
            return
        
        # Try to mark complete
        todo = service.mark_complete(todo_id)
        
        # Check if already completed
        if todo.completed:
            # Get fresh copy to check if it was already complete before
            # Since we just marked it, we need to check differently
            # For now, show success message (idempotent operation)
            pass
        
        print()
        print(f"✓ Todo #{todo.id} marked as complete!")
        print(f"  Description: {todo.description}")
        print(f"  Status: ✓ Completed")
        print()
        
    except KeyError as e:
        print(f"✗ Error: {e}")
        print("Please check the ID and try again.")
        print()
    
    input("Press Enter to continue...")


def update_todo_flow(service: TodoService) -> None:
    """
    Handle the update todo workflow.
    
    Args:
        service: TodoService instance
    """
    print()
    print("--- Update Todo ---")
    
    try:
        todo_id_str = input("Enter todo ID to update: ").strip()
        
        # Convert to int
        try:
            todo_id = int(todo_id_str)
        except ValueError:
            print("✗ Error: Please enter a valid number.")
            print()
            input("Press Enter to continue...")
            return
        
        # Get current todo to show
        try:
            current_todo = service.get_todo(todo_id)
            print(f"Current description: {current_todo.description}")
            print()
        except KeyError as e:
            print(f"✗ Error: {e}")
            print("Please check the ID and try again.")
            print()
            input("Press Enter to continue...")
            return
        
        # Get new description
        new_description = input("Enter new description (or press Enter to cancel): ").strip()
        
        # Check for cancellation
        if not new_description:
            print("Update cancelled.")
            print()
            input("Press Enter to continue...")
            return
        
        # Try to update
        try:
            old_desc = current_todo.description
            updated_todo = service.update_todo(todo_id, new_description)
            
            print()
            print(f"✓ Todo #{updated_todo.id} updated successfully!")
            print(f"  Old: {old_desc}")
            print(f"  New: {updated_todo.description}")
            print()
            
        except ValueError as e:
            print(f"✗ Error: {e}")
            print("Update cancelled.")
            print()
    
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        print()
    
    input("Press Enter to continue...")


def delete_todo_flow(service: TodoService) -> None:
    """
    Handle the delete todo workflow with confirmation.
    
    Args:
        service: TodoService instance
    """
    print()
    print("--- Delete Todo ---")
    
    try:
        todo_id_str = input("Enter todo ID to delete: ").strip()
        
        # Convert to int
        try:
            todo_id = int(todo_id_str)
        except ValueError:
            print("✗ Error: Please enter a valid number.")
            print()
            input("Press Enter to continue...")
            return
        
        # Get current todo to show
        try:
            current_todo = service.get_todo(todo_id)
            print(f"Current todo: {current_todo.description}")
            print()
        except KeyError as e:
            print(f"✗ Error: {e}")
            print("Please check the ID and try again.")
            print()
            input("Press Enter to continue...")
            return
        
        # Confirm deletion
        confirmation = input("Are you sure you want to delete this todo? (yes/no): ").strip().lower()
        
        # Check confirmation
        if confirmation in ["yes", "y"]:
            service.delete_todo(todo_id)
            print()
            print(f"✓ Todo #{todo_id} deleted successfully.")
            print()
        else:
            print("Delete cancelled.")
            print()
    
    except KeyError as e:
        print(f"✗ Error: {e}")
        print("Please check the ID and try again.")
        print()
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        print()
    
    input("Press Enter to continue...")

