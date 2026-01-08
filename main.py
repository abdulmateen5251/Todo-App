"""
Main entry point for the Todo Application.

This module provides the main application loop for a console-based
todo management system with in-memory storage.
"""
from src.services.todo_service import TodoService
from src.cli.menu import (
    display_main_menu,
    get_user_choice,
    add_todo_flow,
    view_todos_flow,
    exit_flow,
    mark_complete_flow,
    update_todo_flow,
    delete_todo_flow
)


def main() -> None:
    """Main application entry point."""
    # Initialize service
    service = TodoService()
    
    try:
        # Main application loop
        while True:
            display_main_menu()
            choice = get_user_choice()
            
            if choice == "1":
                add_todo_flow(service)
            elif choice == "2":
                view_todos_flow(service)
            elif choice == "3":
                update_todo_flow(service)
            elif choice == "4":
                delete_todo_flow(service)
            elif choice == "5":
                mark_complete_flow(service)
            elif choice == "6":
                exit_flow()
                break
    
    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully
        print("\n\n" + "=" * 43)
        print("     Application interrupted by user.")
        print("     All todos are stored in memory.")
        print("     Your todos will be lost.")
        print("=" * 43)
        print("\nGoodbye! 👋\n")


if __name__ == "__main__":
    main()
