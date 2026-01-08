"""
Integration test to verify complete user workflows.

This test simulates the full user journey through all features.
"""
from src.services.todo_service import TodoService


def test_full_user_workflow():
    """Test complete user workflow through all features."""
    service = TodoService()
    
    # US1: Add and View Todos
    print("\n=== Testing User Story 1: Add and View ===")
    todo1 = service.add_todo("Review pull request #42")
    todo2 = service.add_todo("Fix authentication bug")
    todo3 = service.add_todo("Update documentation")
    
    todos = service.get_all_todos()
    assert len(todos) == 3
    print(f"✓ Added 3 todos")
    
    counts = service.get_counts()
    assert counts["total"] == 3
    assert counts["pending"] == 3
    assert counts["completed"] == 0
    print(f"✓ Counts: {counts}")
    
    # US2: Mark Complete
    print("\n=== Testing User Story 2: Mark Complete ===")
    service.mark_complete(todo2.id)
    
    counts = service.get_counts()
    assert counts["completed"] == 1
    assert counts["pending"] == 2
    print(f"✓ Marked todo #{todo2.id} as complete")
    print(f"✓ Updated counts: {counts}")
    
    # Test idempotent mark complete
    service.mark_complete(todo2.id)
    counts = service.get_counts()
    assert counts["completed"] == 1
    print(f"✓ Idempotent mark complete verified")
    
    # US3: Update Todo
    print("\n=== Testing User Story 3: Update ===")
    old_desc = todo1.description
    service.update_todo(todo1.id, "Review and merge pull request #42")
    
    updated = service.get_todo(todo1.id)
    assert updated.description == "Review and merge pull request #42"
    assert updated.id == todo1.id
    assert updated.completed == todo1.completed
    print(f"✓ Updated todo #{todo1.id}")
    print(f"  Old: {old_desc}")
    print(f"  New: {updated.description}")
    
    # US4: Delete Todo
    print("\n=== Testing User Story 4: Delete ===")
    service.delete_todo(todo3.id)
    
    remaining = service.get_all_todos()
    assert len(remaining) == 2
    assert todo3.id not in [t.id for t in remaining]
    print(f"✓ Deleted todo #{todo3.id}")
    print(f"✓ Remaining todos: {len(remaining)}")
    
    # Verify IDs are preserved
    assert remaining[0].id == 1
    assert remaining[1].id == 2
    print(f"✓ IDs preserved after deletion")
    
    # Test get_todos_by_status
    print("\n=== Testing Status Filtering ===")
    completed_todos = service.get_todos_by_status(completed=True)
    pending_todos = service.get_todos_by_status(completed=False)
    
    assert len(completed_todos) == 1
    assert len(pending_todos) == 1
    print(f"✓ Completed todos: {len(completed_todos)}")
    print(f"✓ Pending todos: {len(pending_todos)}")
    
    print("\n=== All User Stories Verified Successfully! ===\n")


if __name__ == "__main__":
    test_full_user_workflow()
    print("✅ Integration test passed!")
