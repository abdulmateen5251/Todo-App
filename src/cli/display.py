"""
Display formatting functions for the CLI.

This module provides functions to format and display todo information.
"""
from typing import List, Dict
from src.models.todo import Todo


def format_todo_list(todos: List[Todo], counts: Dict[str, int]) -> str:
    """
    Format a list of todos for display.
    
    Args:
        todos: List of Todo objects to display
        counts: Dictionary with total, pending, completed counts
        
    Returns:
        Formatted string ready for printing
    """
    lines = []
    lines.append("=" * 46)
    lines.append(" " * 16 + "Your Todos")
    lines.append("=" * 46)
    lines.append("")
    lines.append(" ID | Status | Description")
    lines.append("----|--------|" + "-" * 34)
    
    for todo in todos:
        status = "[✓]" if todo.completed else "[ ]"
        # Truncate long descriptions for display
        desc = todo.description
        if len(desc) > 50:
            desc = desc[:47] + "..."
        lines.append(f"{todo.id:3d} | {status:6s} | {desc}")
    
    lines.append("")
    lines.append("=" * 46)
    lines.append(
        f"Summary: {counts['total']} total | "
        f"{counts['pending']} pending | "
        f"{counts['completed']} completed"
    )
    lines.append("=" * 46)
    
    return "\n".join(lines)


def format_empty_list(counts: Dict[str, int]) -> str:
    """
    Format display for empty todo list.
    
    Args:
        counts: Dictionary with total, pending, completed counts
        
    Returns:
        Formatted string ready for printing
    """
    lines = []
    lines.append("=" * 46)
    lines.append(" " * 16 + "Your Todos")
    lines.append("=" * 46)
    lines.append("")
    lines.append("  You have no todos yet!")
    lines.append("  Press 1 from the main menu to add your first todo.")
    lines.append("")
    lines.append("=" * 46)
    lines.append(
        f"Summary: {counts['total']} total | "
        f"{counts['pending']} pending | "
        f"{counts['completed']} completed"
    )
    lines.append("=" * 46)
    
    return "\n".join(lines)
