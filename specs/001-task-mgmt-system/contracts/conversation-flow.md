# Conversation Flow & State Machine

**Purpose**: This document defines the stateless conversation flow and agent execution patterns for the task management system.

## Architectural Principle: Stateless Request Cycle

The backend maintains **ZERO in-memory state** between requests. Every request follows this cycle:

```
1. Receive HTTP request (user message + JWT token)
2. Validate token → extract user_id
3. Fetch conversation history from database (user_id)
4. Build messages array: [history... + new user message]
5. Store new user message in database
6. Invoke OpenAI Agents SDK with messages + tools
7. Agent processes message (may invoke tools)
8. Store assistant response in database
9. Return assistant response to client
10. Request complete → server holds NO state
```

## Request Flow Diagram

```
┌─────────────┐
│   Client    │ (ChatKit UI)
│  (Browser)  │
└──────┬──────┘
       │
       │ POST /api/chat
       │ { "message": "Create task...", "Authorization": "Bearer <JWT>" }
       ▼
┌──────────────────┐
│  FastAPI Server  │
│  (Stateless)     │
└──────┬───────────┘
       │
       │ 1. Validate JWT → user_id
       ▼
┌──────────────────┐
│   PostgreSQL     │ ← 2. SELECT messages WHERE user_id=X ORDER BY created_at
│  (Neon)          │
└──────┬───────────┘
       │
       │ 3. Return conversation history
       ▼
┌──────────────────┐
│  FastAPI Server  │ ← 4. Build messages array
│                  │ ← 5. INSERT new user message
└──────┬───────────┘
       │
       │ 6. Call OpenAI Agents SDK
       ▼
┌──────────────────┐
│  OpenAI API      │ ← 7. Process with GPT-4 + tools
│  (Agents SDK)    │
└──────┬───────────┘
       │
       │ 8. Return response (may include tool calls)
       ▼
┌──────────────────┐
│  FastAPI Server  │ ← 9. Execute tool if requested (e.g., add_task)
│  (MCP Tools)     │ ← 10. Get tool result
│                  │ ← 11. Send tool result back to OpenAI
│                  │ ← 12. Get final response
└──────┬───────────┘
       │
       │ 13. INSERT assistant message into database
       ▼
┌──────────────────┐
│   PostgreSQL     │
│  (Neon)          │
└──────┬───────────┘
       │
       │ 14. Return response to client
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

## Agent Responsibilities

The OpenAI Agent (GPT-4 with function calling) is responsible for:

1. **Intent Classification**: Determine if the user wants to create, read, update, complete, or delete a task
2. **Parameter Extraction**: Extract task details (title, due date, priority, etc.) from natural language
3. **Scope Enforcement**: Decline requests outside task management domain
4. **Tool Selection**: Choose the appropriate MCP tool(s) to fulfill the request
5. **Response Generation**: Compose natural, conversational responses incorporating tool results
6. **Clarification**: Ask follow-up questions when user input is ambiguous

## Agent System Prompt

```
You are a task management assistant. You can ONLY help users with:
- Creating tasks
- Viewing/listing tasks
- Updating task properties
- Marking tasks as complete
- Deleting tasks

You MUST decline all other requests politely and refocus the conversation on task management.

Guidelines:
1. Be concise and clear in your responses
2. Always confirm actions taken (e.g., "I've created a task titled 'X'")
3. Never mention system internals (MCP tools, database, APIs, or technical implementation)
4. Never access or reference data for users other than the current authenticated user
5. If multiple tasks match a user's description, ask for clarification before acting
6. For destructive actions (delete), seek confirmation if the request is ambiguous
7. Extract as much detail as possible from user messages (titles, dates, priorities) but don't fabricate information
8. Provide helpful suggestions when users make errors (e.g., suggest valid priority values)

Examples of good responses:
- "I've created a task: 'Buy groceries'. Would you like to add a due date?"
- "You have 3 pending tasks: 1) Buy groceries, 2) Finish report (due Friday), 3) Call dentist."
- "I've marked 'Buy groceries' as complete. Great work!"

Examples of scope violations to decline:
- User: "What's the weather?" → "I can only help with task management. Would you like to create a task related to checking the weather?"
- User: "Calculate 5 times 8" → "I'm a task management assistant. I can help you create, view, update, or complete tasks."
```

## Natural Language Command Mapping

This table shows how user intents map to MCP tool invocations:

| User Intent | Example Utterance | Agent Action | MCP Tool Invoked |
|------------|-------------------|--------------|------------------|
| Add task | "Create a task to buy groceries" | Extract title, create task | `add_task(title="Buy groceries")` |
| Add task with details | "Add task: finish report by Friday, high priority" | Extract title, due date, priority | `add_task(title="Finish report", due_date="2026-01-31", priority="high")` |
| List all tasks | "Show me my tasks" | Retrieve all tasks | `list_tasks(status="all")` |
| List pending tasks | "What do I need to do?" | Retrieve incomplete tasks | `list_tasks(status="pending")` |
| List completed tasks | "What have I finished?" | Retrieve completed tasks | `list_tasks(status="completed")` |
| Complete task | "Mark 'buy groceries' as done" | Find task by title, complete it | `list_tasks()` → `complete_task(task_id=42)` |
| Update task | "Change the due date of my report to Monday" | Find task, update field | `list_tasks()` → `update_task(task_id=43, due_date="2026-01-27")` |
| Delete task | "Remove the groceries task" | Find task, delete it | `list_tasks()` → `delete_task(task_id=42)` |
| Out of scope | "What's the weather?" | Decline politely | (no tool invoked) |

## Ambiguity Resolution Strategy

When user input is ambiguous, the agent MUST ask clarifying questions **before** invoking destructive tools.

### Case 1: Multiple Matching Tasks

**User**: "Delete the shopping task"  
**System**: (Internally runs `list_tasks()`, finds 3 tasks with "shopping" in title)  
**Agent Response**: "I found 3 tasks related to shopping:
1. Buy groceries for the week (ID: 42)
2. Online shopping for gifts (ID: 45)
3. Shop for new shoes (ID: 47)

Which one would you like to delete?"

**User**: "The first one"  
**System**: (Invokes `delete_task(task_id=42)`)  
**Agent Response**: "I've deleted 'Buy groceries for the week'."

### Case 2: Incomplete Information

**User**: "Create a task"  
**Agent Response**: "Sure! What should the task be about?"

**User**: "Finish the project report"  
**System**: (Invokes `add_task(title="Finish the project report")`)  
**Agent Response**: "I've created a task: 'Finish the project report'. Would you like to add a due date or priority?"

## Determinism Requirements

Given identical conversation history and user input, the agent MUST produce consistent behavior:

- **Same tool selection**: "Show my tasks" always invokes `list_tasks()`
- **Same parameter extraction**: "Create task to buy milk" always results in `add_task(title="Buy milk")`
- **No creative interpretation**: Don't invent task details not mentioned by the user
- **Predictable error handling**: Same error conditions produce same error messages

**Anti-pattern** (Non-deterministic):
```python
# DON'T: Randomize responses
responses = [
    "Task created!",
    "Got it, I've added that task.",
    "All set! Task is now in your list."
]
return random.choice(responses)  # ❌ Non-deterministic
```

**Best practice** (Deterministic):
```python
# DO: Consistent responses
return f"I've created a task: '{task.title}'."  # ✅ Deterministic
```

## Conversation Context Limits

To prevent unbounded database queries and API costs:

- **Fetch last 50 messages** per request (sufficient for multi-turn context)
- **Truncate if history exceeds 50**: Keep most recent messages
- **Future enhancement**: Implement conversation summarization for very long histories

```python
async def get_conversation_history(user_id: int) -> list[dict]:
    messages = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.user_id == user_id)
        .order_by(ConversationMessage.created_at.desc())
        .limit(50)  # ← Context window limit
    )
    return [
        {"role": m.role, "content": m.content}
        for m in reversed(messages)  # Chronological order
    ]
```

## Error Handling in Conversation Flow

When errors occur, the agent must surface them conversationally:

### OpenAI API Timeout
**System**: (OpenAI request times out)  
**FastAPI**: Returns HTTP 503  
**Client**: Displays error to user  
**User sees**: "The AI service is taking longer than usual. Please try again in a moment."

### Database Unavailable
**System**: (PostgreSQL connection fails)  
**FastAPI**: Returns HTTP 503  
**Client**: Displays error  
**User sees**: "We're experiencing technical difficulties. Your data is safe and we'll be back shortly."

### Invalid Tool Parameters
**User**: "Create task with priority super-urgent"  
**Agent**: Invokes `add_task(title="...", priority="super-urgent")`  
**Tool**: Returns `{"success": false, "error": "Priority must be 'low', 'medium', or 'high'."}`  
**Agent**: "I couldn't set the priority to 'super-urgent'. Valid options are 'low', 'medium', or 'high'. Which would you prefer?"

## Multi-Turn Conversation Example

**Turn 1**:
- **User**: "I need to organize my week"
- **Agent**: "I can help with that! Would you like to create tasks for specific activities, or would you like to see your existing tasks first?"

**Turn 2**:
- **User**: "Show what I have"
- **System**: Invokes `list_tasks(status="all")`
- **Tool Result**: 2 tasks found
- **Agent**: "You have 2 tasks:
  1. Buy groceries (pending)
  2. Finish project report (pending, due Friday, high priority)
  
  Would you like to add more tasks or modify these?"

**Turn 3**:
- **User**: "Add a task to call the dentist tomorrow"
- **System**: Invokes `add_task(title="Call the dentist", due_date="2026-01-27")`
- **Tool Result**: Success
- **Agent**: "I've added 'Call the dentist' with a due date of tomorrow. Anything else?"

**Turn 4**:
- **User**: "That's all, thanks"
- **Agent**: "You're all set! You have 3 tasks on your list. Let me know if you need anything else."

## State Verification

After each request, verify statelessness:

```python
# CORRECT: No global state
async def process_chat_message(user_id: int, message: str):
    # 1. Fetch context from database
    history = await get_conversation_history(user_id)
    
    # 2. Build request (stateless)
    messages = history + [{"role": "user", "content": message}]
    
    # 3. Call OpenAI (stateless)
    response = await openai_client.chat.completions.create(
        model="gpt-4-turbo-preview",
        messages=messages,
        tools=TOOLS
    )
    
    # 4. Store result (persist to database)
    await save_message(user_id, "user", message)
    await save_message(user_id, "assistant", response.choices[0].message.content)
    
    # 5. Return (no state retained)
    return response.choices[0].message.content
```

```python
# INCORRECT: In-memory state
conversation_cache = {}  # ❌ Global state

async def process_chat_message(user_id: int, message: str):
    if user_id not in conversation_cache:
        conversation_cache[user_id] = []  # ❌ Violates stateless principle
    
    conversation_cache[user_id].append(message)  # ❌ State lost on restart
    # ... rest of logic
```

## Compliance Checklist

Every request MUST:
- [ ] Validate authentication before processing
- [ ] Fetch conversation history from database (not cache)
- [ ] Store all messages (user + assistant) in database
- [ ] Process requests independently (no shared state)
- [ ] Enforce user isolation in all database queries
- [ ] Return consistent responses for identical inputs
- [ ] Decline out-of-scope requests gracefully
