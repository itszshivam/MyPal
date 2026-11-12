
import os
import json
import time

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(
    api_key=API_KEY,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            attempts=4,
            initial_delay=1,
            max_delay=8,
            http_status_codes=[503, 500, 502, 504]
        )
    )
) if API_KEY else None

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    transactions: list[dict] = Field(default_factory=list)


def money(amount, currency="INR"):
    symbols = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€",
        "GBP": "£"
    }

    symbol = symbols.get(str(currency).upper(), f"{currency} ")
    return f"{symbol}{amount}"


def transaction_details(txn):
    return (
        f"Merchant: {txn.get('name', 'Unknown')}\n"
        f"Amount: {money(txn.get('amount', 'N/A'), txn.get('currency', 'INR'))}\n"
        f"Status: {txn.get('status', 'Unknown')}\n"
        f"Date: {txn.get('date', 'Not available')}\n"
        f"Reference: {txn.get('reference', 'N/A')}\n"
        f"Source: {txn.get('source', 'MyPal')}"
    )


def generate_response(
    message: str,
    transactions: list[dict]
) -> Optional[str]:

    query = message.lower().strip()

    if any(word in query.split() for word in ["hello", "hi", "hey"]):
        return (
            "Hello! Welcome to MyPal ONE Assist.\n\n"
            "I can help you understand your payments, "
            "find transactions, investigate pending payments, "
            "and understand refund procedures.\n\n"
            "What would you like help with?"
        )

    if "pending" in query:
        pending = [
            txn for txn in transactions
            if str(txn.get("status", "")).lower() == "pending"
        ]

        if not pending:
            return "I couldn't find any pending transactions in the records provided."

        return (
            f"I found {len(pending)} pending transaction(s):\n\n"
            + "\n\n".join(transaction_details(t) for t in pending)
            + "\n\nA pending status means the payment has not yet been "
            "confirmed as completed. Check the official payment provider "
            "for the latest status before retrying."
        )

    if "failed" in query:
        failed = [
            txn for txn in transactions
            if str(txn.get("status", "")).lower() == "failed"
        ]

        if not failed:
            return "I couldn't find any failed transactions in the records provided."

        return (
            f"I found {len(failed)} failed transaction(s):\n\n"
            + "\n\n".join(transaction_details(t) for t in failed)
            + "\n\nRecommended actions:\n"
            "1. Check your bank statement.\n"
            "2. Confirm whether money was deducted.\n"
            "3. Contact the official payment provider if needed.\n"
            "4. Keep the transaction reference for support.\n"
            "5. Avoid retrying until the first payment's status is clear."
        )

    if "refund" in query:
        return (
            "I can help you understand your refund situation.\n\n"
            "A refund generally needs to be initiated or approved "
            "by the merchant or payment provider.\n\n"
            "Recommended actions:\n"
            "1. Locate the original transaction.\n"
            "2. Check whether a refund was initiated.\n"
            "3. Check the expected refund timeline.\n"
            "4. Contact official support using your transaction reference."
        )

    matched = []

    search_terms = [
        term for term in query.split()
        if len(term) >= 4
    ]

    for txn in transactions:
        name = str(txn.get("name", "")).lower()
        reference = str(txn.get("reference", "")).lower()

        if any(term in name or term in reference for term in search_terms):
            matched.append(txn)

    if matched:
        return (
            f"I found {len(matched)} matching transaction(s):\n\n"
            + "\n\n".join(transaction_details(t) for t in matched)
        )

    return None


def ask_ai(message: str, transactions: list[dict]) -> str:

    if client is None:
        raise RuntimeError("GEMINI_API_KEY is missing from .env")

    safe_transactions = []

    for txn in transactions[:20]:
        safe_transactions.append({
            key: txn.get(key)
            for key in [
                "name", "amount", "currency",
                "status", "date", "reference", "source"
            ]
            if txn.get(key) is not None
        })

    system_instruction = (
        "You are MyPal ONE Assist, a helpful payment support assistant. "
        "Explain payment concepts clearly and politely. "
        "Use the supplied transaction records only as context. "
        "Never invent transaction details, payment statuses, refunds, "
        "or completed actions. Never claim to move money, issue refunds, "
        "or access a live PayPal account. If information is missing, "
        "say so. Do not request passwords, API keys, or full card details. "
        "For financial decisions, recommend checking the official provider."
    )

    prompt = (
        f"User question:\n{message}\n\n"
        f"Available transaction records:\n"
        f"{json.dumps(safe_transactions, ensure_ascii=False)}"
    )

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.5
        )
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text



@router.post("/chat")
def chat(request: ChatRequest):

    reply = generate_response(
        request.message,
        request.transactions
    )

    if reply is not None:
        return {"reply": reply}

    try:
        reply = ask_ai(
            request.message,
            request.transactions
        )

        if reply:
            return {"reply": reply}

    except Exception as e:
        import traceback
        print("ONE ASSIST GEMINI ERROR:")
        traceback.print_exc()

        return {
            "reply": f"Gemini Error: {str(e)}"
        }
