"""
OpenAI Service with Function Calling Support
"""
import os
import json
from typing import List, Dict, Optional, Tuple
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "sk-mock-key"))


def get_ai_response_with_tools(
    messages: List[Dict],
    tools: List[Dict]
) -> Tuple[Optional[str], Optional[Dict]]:
    """
    Get AI response with function calling support.
    Returns: (text_response, tool_call) - one will be None
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Use gpt-4o-mini for better function calling
            messages=messages,
            tools=tools,
            tool_choice="auto",
            temperature=0.7,
            max_tokens=300,
        )
        
        message = response.choices[0].message
        
        # Check if the model wants to call a function
        if message.tool_calls:
            tool_call = message.tool_calls[0]
            return None, {
                "id": tool_call.id,
                "name": tool_call.function.name,
                "arguments": json.loads(tool_call.function.arguments)
            }
        
        # Otherwise return the text response
        return message.content, None
    
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return f"I'm having trouble processing that request. Error: {str(e)}", None


def get_final_response(
    messages: List[Dict],
    tool_call_id: str,
    tool_result: Dict
) -> str:
    """
    Get the final response after a function has been executed.
    """
    try:
        # Add the tool result to the conversation
        messages_with_result = messages.copy()
        messages_with_result.append({
            "role": "tool",
            "tool_call_id": tool_call_id,
            "content": json.dumps(tool_result)
        })
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_with_result,
            temperature=0.7,
            max_tokens=200,
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"OpenAI API Error in final response: {e}")
        # Fallback to using the tool result message directly
        if tool_result.get("success"):
            return tool_result.get("message", "Action completed successfully.")
        else:
            return tool_result.get("error", "An error occurred.")


def get_ai_response(messages: List[Dict]) -> str:
    """
    Legacy function for simple chat without function calling.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=150,
        )
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return "I'm having trouble connecting right now. Please try again."