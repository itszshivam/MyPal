
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/api/assist",
    tags=["ONE Assist"]
)


class ChatRequest(BaseModel):
    message: str
    transactions: list[dict] = Field(default_factory=list)


def generate_response(message: str, transactions: list[dict]) -> str:
    query = message.lower().strip()

    # 1. Greeting
    if any(word in query for word in ["hello", "hi", "hey"]):
        return (
            "Hello! Welcome to MyPal ONE Assist. "
            "I can help you understand your transactions, "
            "pending payments, failed payments, and refunds. "
            "How can I help you today?"
        )

    # 2. Failed payment advice - check BEFORE general failed search
    if "failed payment" in query or "payment failed" in query:
        failed = [
            txn for txn in transactions
            if str(txn.get("status", "")).lower() == "failed"
        ]

        if failed:
            details = "\n".join(
                f"- {txn.get('name', 'Unknown')} - "
                f"₹{txn.get('amount', 'N/A')} "
                f"(Reference: {txn.get('reference', 'N/A')})"
                for txn in failed
            )

            return (
                "I found these failed transactions:\n"
                f"{details}\n\n"
                "Here's what you can do:\n"
                "1. Check your transaction status.\n"
                "2. Check whether the amount was deducted.\n"
                "3. If the amount was deducted, contact your bank "
                "or payment provider.\n"
                "4. Keep your transaction reference for support.\n"
                "5. Avoid paying again until you confirm the first "
                "payment's status."
            )

        return "I couldn't find any failed transactions in your records."

    # 3. Pending transactions
    if "pending" in query:
        pending = [
            txn for txn in transactions
            if str(txn.get("status", "")).lower() == "pending"
        ]

        if pending:
            return (
                "Here are your pending transactions:\n"
                + "\n".join(
                    f"- {txn.get('name', 'Unknown')} - "
                    f"₹{txn.get('amount', 'N/A')} "
                    f"(Reference: {txn.get('reference', 'N/A')})"
                    for txn in pending
                )
                + "\n\nA pending payment may still be processing. "
                "Check its status with your payment provider."
            )

        return "You don't have any pending transactions in your records."

    # 4. General failed transaction listing
    if "failed" in query:
        failed = [
            txn for txn in transactions
            if str(txn.get("status", "")).lower() == "failed"
        ]

        if failed:
            return (
                "Here are your failed transactions:\n"
                + "\n".join(
                    f"- {txn.get('name', 'Unknown')} - "
                    f"₹{txn.get('amount', 'N/A')} "
                    f"(Reference: {txn.get('reference', 'N/A')})"
                    for txn in failed
                )
            )

        return "You don't have any failed transactions in your records."

    # 5. Refund guidance
    if "refund" in query:
        return (
            "For a refund, first check the original transaction status "
            "and refund policy of the merchant. If a refund was approved "
            "but hasn't arrived, contact the merchant or payment provider "
            "with your transaction reference. Refund timelines can vary."
        )

    # 6. Merchant or transaction-reference search
    matched = [
        txn for txn in transactions
        if (
            query in str(txn.get("name", "")).lower()
            or query in str(txn.get("reference", "")).lower()
        )
    ]

    if matched:
        return (
            "I found these matching transactions:\n"
            + "\n".join(
                f"- {txn.get('name', 'Unknown')} - "
                f"₹{txn.get('amount', 'N/A')} - "
                f"Status: {txn.get('status', 'Unknown')} - "
                f"Reference: {txn.get('reference', 'N/A')}"
                for txn in matched
            )
        )

    # 7. Default response
    return (
        "I'm your MyPal ONE Assist. I can help you find pending "
        "or failed transactions, search by merchant or reference, "
        "and understand refund steps. What would you like to know?"
    )


@router.post("/chat")
def chat(request: ChatRequest):
    reply = generate_response(
        request.message,
        request.transactions
    )

    return {"reply": reply}
