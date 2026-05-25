"""Webhooks router — Telegram incoming messages and outbound sends."""
import os
import logging
from typing import Optional

from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")


class SendMessageRequest(BaseModel):
    """Request to send a message via Telegram bot."""
    telegram_id: str
    message: str
    parse_mode: str = "Markdown"


@router.post("/telegram")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Handle all incoming Telegram messages.
    This endpoint receives webhook updates from Telegram.
    In production, this is registered with Telegram via setWebhook.
    """
    try:
        body = await request.json()
        logger.info(f"Telegram webhook received: {body.get('update_id', 'unknown')}")

        # Extract message info
        message = body.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        text = message.get("text", "")
        username = message.get("from", {}).get("username")

        if not chat_id:
            return {"ok": True, "detail": "No chat_id in update"}

        # Route to bot handler
        from backend.services.telegram_bot import handle_telegram_update
        await handle_telegram_update(
            chat_id=str(chat_id),
            text=text,
            username=username,
            db=db,
        )

        return {"ok": True}

    except Exception as e:
        logger.error(f"Telegram webhook error: {e}")
        return {"ok": True, "error": str(e)}


@router.post("/send")
async def send_message(data: SendMessageRequest):
    """Send a message to a Telegram user via the bot."""
    if not TELEGRAM_BOT_TOKEN:
        raise HTTPException(status_code=503, detail="Telegram bot not configured")

    import httpx
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            json={
                "chat_id": data.telegram_id,
                "text": data.message,
                "parse_mode": data.parse_mode,
            },
        )
        result = response.json()
        if not result.get("ok"):
            logger.error(f"Telegram send failed: {result}")
            raise HTTPException(status_code=502, detail="Telegram API error")

    return {"ok": True, "message_id": result.get("result", {}).get("message_id")}
