import uuid
import time
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, Dict

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    intent: str
    session_id: str
    agent_trace: list = []


@router.get("/status")
async def get_status(request: Request):
    colab = request.app.state.colab
    health = await colab.check_health()
    return {
        "colab_connected": colab.is_connected,
        "colab_url": colab.base_url,
        "colab_health": health,
        "last_seen": colab.last_connected,
        "uptime_seconds": int(time.time() - colab.last_connected),
    }


@router.post("/reconnect")
async def reconnect(request: Request):
    colab = request.app.state.colab
    colab.update_url(colab.base_url)
    health = await colab.check_health()
    return {
        "success": colab.is_connected,
        "colab_url": colab.base_url,
        "colab_health": health,
    }


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request):
    session_id = req.session_id or str(uuid.uuid4())
    db = request.app.state.db
    colab = request.app.state.colab

    context = await db.get_conversation_history(session_id)

    result = await colab.chat(req.message, {"history": context})
    await db.save_conversation(session_id, "user", req.message, result.get("intent", ""))
    await db.save_conversation(session_id, "assistant", result.get("response", ""))

    return ChatResponse(
        response=result.get("response", ""),
        intent=result.get("intent", "general"),
        session_id=session_id,
        agent_trace=result.get("agent_trace", []),
    )


@router.get("/chat/history/{session_id}")
async def get_history(session_id: str, request: Request):
    db = request.app.state.db
    history = await db.get_conversation_history(session_id)
    return {"session_id": session_id, "messages": history}
