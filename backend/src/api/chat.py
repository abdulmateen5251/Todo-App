"""Chat endpoint for conversational task management."""
import json
import logging
from typing import Annotated, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.auth import get_current_user
from src.db.session import get_session
from src.models.user import User
from src.services.conversation_service import conversation_service
from src.agent import openai_client, TASK_AGENT_SYSTEM_PROMPT, DEFAULT_MODEL, DEFAULT_TEMPERATURE, get_available_tools
from src.mcp_tools.add_task import execute_add_task
from src.mcp_tools.list_tasks import execute_list_tasks
from src.mcp_tools.complete_task import execute_complete_task
from src.mcp_tools.update_task import execute_update_task
from src.mcp_tools.delete_task import execute_delete_task

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    message: str


class ChatResponse(BaseModel):
    """Response body for chat endpoint."""
    message: str
    tool_calls: list[Dict[str, Any]] | None = None
    tool_results: list[Dict[str, Any]] | None = None


@router.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """
    Process conversational task management requests.
    
    This endpoint:
    1. Fetches conversation history from database
    2. Sends user message + history to OpenAI agent
    3. Executes any MCP tool calls
    4. Stores conversation messages
    5. Returns AI response to user
    """
    try:
        logger.info(f"Chat request from user {user.id}: {request.message[:100]}")
        
        # Step 1: Fetch conversation history
        history = await conversation_service.get_conversation_history(
            session=session,
            user_id=user.id,
            limit=50
        )
        
        # Step 2: Save user message
        await conversation_service.save_message(
            session=session,
            user_id=user.id,
            role="user",
            content=request.message
        )
        
        # Step 3: Build messages for OpenAI
        messages = [
            {"role": "system", "content": TASK_AGENT_SYSTEM_PROMPT},
            *history,
            {"role": "user", "content": request.message}
        ]
        
        # Step 4: Call OpenAI with function calling
        tools = get_available_tools()
        
        response = await openai_client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=messages,
            tools=tools,
            tool_choice="auto",  # Allow model to choose when to use tools
            temperature=DEFAULT_TEMPERATURE
        )
        
        assistant_message = response.choices[0].message
        
        # Step 5: Execute tool calls if any
        tool_calls_data = []
        tool_results_data = []
        
        if assistant_message.tool_calls:
            logger.info(f"Agent called {len(assistant_message.tool_calls)} tool(s) for user {user.id}")
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)  # Parse JSON string safely
                
                tool_calls_data.append({
                    "id": tool_call.id,
                    "name": tool_name,
                    "arguments": tool_args
                })
                
                # Execute tool with error handling
                try:
                    if tool_name == "add_task":
                        result = await execute_add_task(
                            user_id=user.id,
                            session=session,
                            **tool_args
                        )
                        tool_results_data.append({
                            "id": tool_call.id,
                            "result": result
                        })
                    elif tool_name == "list_tasks":
                        result = await execute_list_tasks(
                            user_id=user.id,
                            session=session,
                            **tool_args
                        )
                        tool_results_data.append({
                            "id": tool_call.id,
                            "result": result
                        })
                    elif tool_name == "complete_task":
                        result = await execute_complete_task(
                            user_id=user.id,
                            session=session,
                            **tool_args
                        )
                        tool_results_data.append({
                            "id": tool_call.id,
                            "result": result
                        })
                    elif tool_name == "update_task":
                        result = await execute_update_task(
                            user_id=user.id,
                            session=session,
                            **tool_args
                        )
                        tool_results_data.append({
                            "id": tool_call.id,
                            "result": result
                        })
                    elif tool_name == "delete_task":
                        result = await execute_delete_task(
                            user_id=user.id,
                            session=session,
                            **tool_args
                        )
                        tool_results_data.append({
                            "id": tool_call.id,
                            "result": result
                        })
                except ValueError as e:
                    # Tool execution failed with validation error
                    logger.warning(f"Tool {tool_name} failed for user {user.id}: {str(e)}")
                    tool_results_data.append({
                        "id": tool_call.id,
                        "result": {
                            "success": False,
                            "error": str(e)
                        }
                    })
                except Exception as e:
                    # Tool execution failed with unexpected error
                    logger.error(f"Tool {tool_name} error for user {user.id}: {str(e)}", exc_info=True)
                    tool_results_data.append({
                        "id": tool_call.id,
                        "result": {
                            "success": False,
                            "error": f"Failed to execute {tool_name}: {str(e)}"
                        }
                    })
        
        # Step 6: Get final response (may need second API call if tools were used)
        final_content = assistant_message.content
        
        if tool_calls_data and not final_content:
            # Send tool results back to get natural language response
            messages.append({
                "role": "assistant",
                "content": None,
                "tool_calls": assistant_message.tool_calls
            })
            
            for tool_result in tool_results_data:
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_result["id"],
                    "content": str(tool_result["result"])
                })
            
            second_response = await openai_client.chat.completions.create(
                model=DEFAULT_MODEL,
                messages=messages,
                temperature=DEFAULT_TEMPERATURE
            )
            
            final_content = second_response.choices[0].message.content
        
        # Step 7: Save assistant message
        await conversation_service.save_message(
            session=session,
            user_id=user.id,
            role="assistant",
            content=final_content or "",
            tool_calls=str(tool_calls_data) if tool_calls_data else None,
            tool_results=str(tool_results_data) if tool_results_data else None
        )
        
        logger.info(f"Chat response sent to user {user.id}: {len(final_content or '')} chars")
        
        return ChatResponse(
            message=final_content or "Task completed successfully",
            tool_calls=tool_calls_data if tool_calls_data else None,
            tool_results=tool_results_data if tool_results_data else None
        )
        
    except ValueError as e:
        logger.warning(f"Validation error for user {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Chat processing failed for user {user.id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )
