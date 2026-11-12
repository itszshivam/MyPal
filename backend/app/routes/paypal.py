"""PayPal Sandbox Orders v2 endpoints for MyPal.

The PayPal client secret stays on the backend. Never expose it to React.
"""

import base64
import json
import os
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(prefix="/api/paypal", tags=["PayPal Sandbox"])

SANDBOX_API = "https://api-m.sandbox.paypal.com"
DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "paypal_transactions.json"


class CreateOrderRequest(BaseModel):
    amount: Decimal = Field(gt=Decimal("0"), le=Decimal("10000"), max_digits=10, decimal_places=2)
    currency_code: str = Field(default="USD", min_length=3, max_length=3)
    description: str = Field(default="MyPal Sandbox payment", min_length=1, max_length=127)



def _credentials() -> tuple[str, str]:
    client_id = os.getenv("PAYPAL_CLIENT_ID", "").strip()
    client_secret = os.getenv("PAYPAL_CLIENT_SECRET", "").strip()
    if not client_id or not client_secret:
        raise HTTPException(
            status_code=503,
            detail="PayPal Sandbox is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to backend/.env.",
        )
    return client_id, client_secret


def _paypal_request(method: str, path: str, payload: dict[str, Any] | None = None,
                    request_id: str | None = None) -> dict[str, Any]:
    client_id, client_secret = _credentials()
    credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    token_request = Request(
        f"{SANDBOX_API}/v1/oauth2/token",
        data=b"grant_type=client_credentials",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )

    try:
        with urlopen(token_request, timeout=20) as response:
            token_data = json.loads(response.read().decode("utf-8"))
        access_token = token_data["access_token"]

        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation",
        }
        if request_id:
            headers["PayPal-Request-Id"] = request_id

        api_request = Request(
            f"{SANDBOX_API}{path}", data=body, headers=headers, method=method
        )
        with urlopen(api_request, timeout=25) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}

    except HTTPError as exc:
        try:
            error_data = json.loads(exc.read().decode("utf-8"))
            message = error_data.get("message") or error_data.get("name") or "PayPal request failed"
        except Exception:
            message = "PayPal request failed"
        raise HTTPException(status_code=502, detail=f"PayPal Sandbox error: {message}") from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(status_code=502, detail="Could not reach PayPal Sandbox. Check your connection and try again.") from exc
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="PayPal returned an unexpected response.") from exc


def _read_saved_transactions() -> list[dict[str, Any]]:
    if not DATA_FILE.exists():
        return []
    try:
        return json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def _save_transaction(transaction: dict[str, Any]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    transactions = _read_saved_transactions()
    if not any(item.get("capture_id") == transaction.get("capture_id") for item in transactions):
        transactions.insert(0, transaction)
        DATA_FILE.write_text(json.dumps(transactions, indent=2), encoding="utf-8")



@router.get("/transactions")
def get_transactions():
    return {"transactions": _read_saved_transactions()}


@router.post("/orders")
def create_order(order: CreateOrderRequest):
    currency = order.currency_code.upper()

    if currency != "USD":
        raise HTTPException(
            status_code=400,
            detail="The first MyPal Sandbox checkout currently supports USD only."
        )

    amount = format(
        order.amount.quantize(Decimal("0.01")), ".2f"
    )

    result = _paypal_request(
        "POST",
        "/v2/checkout/orders",
        {
            "intent": "CAPTURE",

            "application_context": {
                "return_url": "http://localhost:5173/?paypal=success",
                "cancel_url": "http://localhost:5173/?paypal=cancel",
                "shipping_preference": "NO_SHIPPING"
            },

            "purchase_units": [{
                "reference_id": f"MYPAL-{uuid4().hex[:10].upper()}",
                "description": order.description,
                "amount": {
                    "currency_code": currency,
                    "value": amount
                }
            }]
        },
        request_id=f"mypal-create-{uuid4()}"
    )

    approval_url = next(
        (
            link["href"]
            for link in result.get("links", [])
            if link.get("rel") in {"approve", "payer-action"}
        ),
        None
    )

    if not result.get("id") or not approval_url:
        raise HTTPException(
            status_code=502,
            detail="PayPal created an order but did not return an approval link."
        )

    return {
        "success": True,
        "order_id": result["id"],
        "status": result.get("status", "CREATED"),
        "approval_url": approval_url,
        "amount": amount,
        "currency_code": currency
    }



@router.post("/orders/{order_id}/capture")
def capture_order(order_id: str):
    if not order_id or len(order_id) > _len_limit():
        raise HTTPException(status_code=400, detail="Invalid PayPal order ID.")

    result = _paypal_request(
        "POST",
        f"/v2/checkout/orders/{order_id}/capture",
        {},
        request_id=f"mypal-capture-{order_id}",
    )

    purchase_units = result.get("purchase_units", [])
    payments = purchase_units[0].get("payments", {}) if purchase_units else {}
    captures = payments.get("captures", [])
    capture = captures[0] if captures else {}
    amount_data = capture.get("amount", {})
    payer = result.get("payer", {})
    name = payer.get("name", {})
    payer_name = " ".join(part for part in [name.get("given_name"), name.get("surname")] if part).strip()

    transaction = {
        "order_id": result.get("id", order_id),
        "capture_id": capture.get("id"),
        "status": capture.get("status", result.get("status", "UNKNOWN")),
        "amount": amount_data.get("value"),
        "currency_code": amount_data.get("currency_code"),
        "payer_email": payer.get("email_address"),
        "payer_name": payer_name or None,
        "created_at": capture.get("create_time") or datetime.now(timezone.utc).isoformat(),
        "source": "PayPal Sandbox",
    }

    if transaction["status"] == "COMPLETED" and transaction["capture_id"]:
        _save_transaction(transaction)

    return {"success": transaction["status"] == "COMPLETED", "transaction": transaction}


def _len_limit() -> int:
    return 64


@router.get("/transactions")
def get_paypal_transactions():
    transactions = _read_saved_transactions()
    return {"success": True, "total": len(transactions), "transactions": transactions}
