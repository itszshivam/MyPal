import json
from pathlib import Path
from fastapi import HTTPException
from fastapi import FastAPI
from app.database.connection import check_database
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MyPal API",
    description="Backend API for MyPal",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Welcome to MyPal Backend!",
        "status": "Running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.get("/db-health")
def database_health():
    try:
        check_database()

        return {
            "status": "connected",
            "database": "MyPal"
        }

    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e)
        }

@app.get("/api/transactions")

def get_transactions():
    try:
        file_path = Path(__file__).resolve().parent.parent / "data" / "transactions.json"

        with open(file_path, "r", encoding="utf-8") as file:
            transactions = json.load(file)

        return {
            "success": True,
            "total": len(transactions),
            "transactions": transactions
        }

    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Transaction data file not found"
        )

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Invalid transaction JSON"
        )

    