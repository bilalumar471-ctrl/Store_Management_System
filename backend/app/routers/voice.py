"""
Voice Assistant Router with Function Calling Support
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.session_manager import session_manager
from app.openai_service import get_ai_response_with_tools, get_final_response
from app.voice_tools import VOICE_TOOLS, execute_tool
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.dependencies.auth import get_user_or_above

router = APIRouter(prefix="/api/voice", tags=["Voice Assistant"])


# Request/Response Models
class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    response: str
    session_id: str
    action_performed: Optional[str] = None


class ResetRequest(BaseModel):
    session_id: str


def get_store_context(db: Session) -> str:
    """Get current store inventory for AI context"""
    try:
        products = db.query(Product).all()
        if not products:
            return "The store currently has no products in inventory."
        
        product_list = []
        for p in products:
            product_list.append(
                f"- {p.name}: {p.quantity} in stock, sells for ${p.selling_price:.2f}"
            )
        
        return "Current store inventory:\n" + "\n".join(product_list)
    except Exception as e:
        return "Unable to fetch store inventory."


def get_system_prompt(store_context: str, user_role: str) -> str:
    """Generate system prompt based on user role"""
    
    role_permissions = {
        "user": "create bills/sales, check product stock and prices",
        "admin": "create bills/sales, check stock/prices, add/update products, view sales reports",
        "super_admin": "all operations including user management"
    }
    
    permissions = role_permissions.get(user_role, role_permissions["user"])
    
    return f"""You are a helpful Store Assistant for a retail management system.
The current user has the role: {user_role}
They can: {permissions}

You can help users with:
- Creating bills/sales by specifying products and quantities
- Checking product stock and prices
- Managing inventory (for admin roles)
- Viewing sales reports (for admin roles)
- Managing users (creating/deleting) (for super_admin only)

When users want to make a purchase or create a bill, use the create_bill function.
When they ask about stock, use check_product_stock.
When they ask about prices, use get_product_price.

Keep responses concise and natural since they will be spoken aloud.
Confirm actions after they are completed.

{store_context}"""


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_or_above)
):
    """Handle voice chat with function calling support"""
    
    try:
        # Get conversation history
        conversation = session_manager.get_conversation(request.session_id)
        
        # If this is a new conversation, set up the system message
        if len(conversation) == 1:  # Only system message exists
            store_context = get_store_context(db)
            conversation[0]["content"] = get_system_prompt(store_context, current_user.role)
        
        # Add user message
        session_manager.add_message(
            request.session_id,
            "user",
            request.message
        )
        
        # Get updated conversation
        conversation = session_manager.get_conversation(request.session_id)
        
        # Get AI response with tool support
        text_response, tool_call = get_ai_response_with_tools(conversation, VOICE_TOOLS)
        
        action_performed = None
        
        if tool_call:
            # Execute the tool
            print(f"🔧 Executing tool: {tool_call['name']} with args: {tool_call['arguments']}")
            
            tool_result = execute_tool(
                tool_call["name"],
                tool_call["arguments"],
                db,
                current_user
            )
            
            print(f"📋 Tool result: {tool_result}")
            
            # Get a natural language response based on the tool result
            if tool_result.get("success"):
                action_performed = tool_call["name"]
                # Use the message from tool result directly for speed
                ai_response = tool_result.get("message", "Done!")
            else:
                ai_response = tool_result.get("error", "Sorry, something went wrong.")
        else:
            # No tool call, use the text response
            ai_response = text_response or "I'm not sure how to help with that."
        
        # Add assistant response to history (without tool_call to avoid OpenAI API issues)
        session_manager.add_message(
            request.session_id,
            "assistant",
            ai_response
        )
        
        return ChatResponse(
            response=ai_response,
            session_id=request.session_id,
            action_performed=action_performed
        )
    
    except Exception as e:
        print(f"Error in voice chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset-session")
def reset_session(
    request: ResetRequest,
    current_user: User = Depends(get_user_or_above)
):
    """Reset conversation history for a session"""
    try:
        session_manager.reset_session(request.session_id)
        return {"status": "success", "message": "Session reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
def get_history(
    session_id: str,
    limit: int = 50,
    current_user: User = Depends(get_user_or_above)
):
    """Get conversation history for a session"""
    try:
        conversation = session_manager.get_conversation(session_id)
        # Exclude system message from history
        messages = [msg for msg in conversation if msg["role"] != "system"][-limit:]
        return {
            "session_id": session_id,
            "messages": messages,
            "count": len(messages)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
