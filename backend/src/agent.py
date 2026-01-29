"""AI client configuration - supports both OpenAI and Google Gemini."""
import os
from openai import AsyncOpenAI

# Check which mode to use
USE_OPENAI_MODE = os.getenv("OPENAI_GEMINI_MODE", "false").lower() in ("true", "1", "yes")

if USE_OPENAI_MODE:
    # Use OpenAI's GPT-4o-mini model
    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    if not openai_api_key or openai_api_key.startswith("AIza"):
        raise ValueError(
            "Invalid OPENAI_API_KEY. Please set a valid OpenAI API key in your .env file.\n"
            "Get your key from: https://platform.openai.com/api-keys"
        )
    
    openai_client = AsyncOpenAI(
        api_key=openai_api_key,
        # Use default OpenAI base URL
    )
    DEFAULT_MODEL = "gpt-4o-mini"  # OpenAI's fast and efficient small model
    print(f"🤖 AI Mode: OpenAI (Model: {DEFAULT_MODEL})")
else:
    # Use Google Gemini (FREE)
    gemini_api_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_api_key:
        raise ValueError(
            "GEMINI_API_KEY not found. Please set it in your .env file.\n"
            "Get your free key from: https://aistudio.google.com/app/apikey"
        )
    
    openai_client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    DEFAULT_MODEL = "gemini-1.5-flash"  # Gemini's stable fast model
    print(f"🤖 AI Mode: Gemini (Model: {DEFAULT_MODEL})")
# System prompt defining task management scope and boundaries
TASK_AGENT_SYSTEM_PROMPT = """You are a task management assistant with access to function calling tools.

When the user wants to create, list, update, delete, or complete tasks, you MUST call the appropriate tool function. Do not just describe what you will do - actually call the function.

Available tools:
- add_task: Creates a new task
- list_tasks: Retrieves tasks with optional filters
- update_task: Modifies an existing task
- delete_task: Removes a task
- complete_task: Marks a task as complete

Rules:
1. ALWAYS use tools for task operations - never simulate or describe actions
2. When user says "add task X" → call add_task({"title": "X"})
3. When user says "show tasks" → call list_tasks({})
4. When user says "delete task X" → call delete_task({"title": "X"}) - ALWAYS use title, NOT task_id
5. When user says "complete task X" → call complete_task with title (preferred) or task_id
6. All task operations are scoped to the authenticated user
7. Stay focused on task management - politely decline non-task requests
4. When creating tasks, extract all relevant details from the user's message (priority, due date, category)
5. If information is missing, use sensible defaults: priority=medium, status=pending
6. Always confirm successful operations with a brief, friendly message
7. For errors, explain what went wrong in simple terms and suggest next steps

**Scope boundaries - What you CANNOT do:**
- Weather information or forecasts
- Mathematical calculations (except counting tasks)
- Web searches or current events
- Email or messaging
- File operations
- Calendar management (beyond task due dates)
- Personal advice or opinions
- Code execution or technical support

**How to handle out-of-scope requests:**
If a user asks for something outside task management:
1. Politely acknowledge the request
2. Explain that you're specialized for task management only
3. Redirect to task-related actions you can help with
4. Example: "I can't check the weather, but I can help you create a task to check the forecast later!"

**Mixed requests (partial in-scope):**
If a request has both task and non-task elements:
- Process the task-related portions
- Decline the non-task portions politely
- Example: "I can't calculate the tip, but I've created a task 'Pay restaurant bill' for you!"

**Response style:**
- Be conversational and friendly
- Keep responses concise - users prefer brevity
- Use formatting (lists, bold) to improve readability when showing multiple tasks
- Proactively suggest helpful actions based on context

**Example interactions:**
User: "Remind me to buy groceries tomorrow"
You: *[calls add_task tool]* "✓ Created task 'Buy groceries' for tomorrow with medium priority."

User: "What do I need to do today?"
You: *[calls list_tasks tool with due_date filter]* "You have 3 tasks due today: ..."

User: "What's the weather like?"
You: "I specialize in task management and can't check the weather. Would you like me to create a task to remind you to check the forecast?"

User: "Create a task to call mom and also what's 15% of 80?"
You: *[calls add_task tool]* "✓ Created task 'Call mom'. However, I can't do math calculations - I'm focused on helping you manage tasks!"

Remember: You are stateless - fetch conversation history at the start of each request to maintain context.
"""

# Model configuration
# DEFAULT_MODEL is set above based on OPENAI_GEMINI_MODE
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 500


def get_available_tools():
    """
    Get all registered MCP tools for the agent.
    
    Returns:
        List of tool schemas for OpenAI function calling
    """
    from src.mcp_tools.add_task import get_add_task_schema
    from src.mcp_tools.list_tasks import get_list_tasks_schema
    from src.mcp_tools.complete_task import get_complete_task_schema
    from src.mcp_tools.update_task import get_update_task_schema
    from src.mcp_tools.delete_task import get_delete_task_schema
    
    return [
        {"type": "function", "function": get_add_task_schema()},
        {"type": "function", "function": get_list_tasks_schema()},
        {"type": "function", "function": get_complete_task_schema()},
        {"type": "function", "function": get_update_task_schema()},
        {"type": "function", "function": get_delete_task_schema()}
    ]
