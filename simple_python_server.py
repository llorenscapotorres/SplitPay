#!/usr/bin/env python3
"""
Simple working Python FastAPI server with the same API as Node.js version
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

app = FastAPI(title="SplitBill Python API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory storage
tables_db = {}
bills_db = {}
items_db = {}

# Initialize sample data
def init_sample_data():
    table_id = str(uuid.uuid4())
    tables_db[table_id] = {
        "id": table_id,
        "number": 7,
        "restaurant_name": "bella-vista",
        "qr_code": "https://splitbill.app/t/7/bella-vista",
        "is_active": True,
        "created_at": datetime.now().isoformat()
    }
    
    bill_id = str(uuid.uuid4())
    bills_db[bill_id] = {
        "id": bill_id,
        "table_id": table_id,
        "total": "89.50",
        "paid": "32.75", 
        "remaining": "56.75",
        "status": "partial",
        "guest_count": 4,
        "start_time": datetime.now().isoformat(),
        "is_active": True
    }
    
    # Sample items
    sample_items = [
        {"name": "Caesar Salad", "price": "18.50", "quantity": "1", "paid_quantity": "0"},
        {"name": "Grilled Salmon", "price": "32.00", "quantity": "1", "paid_quantity": "0"},
        {"name": "Wine Bottle (Shared)", "price": "45.00", "quantity": "1", "paid_quantity": "0.5"},
        {"name": "Dessert", "price": "12.00", "quantity": "1", "paid_quantity": "0"},
    ]
    
    for item_data in sample_items:
        item_id = str(uuid.uuid4())
        items_db[item_id] = {
            "id": item_id,
            "bill_id": bill_id,
            **item_data
        }

init_sample_data()

@app.get("/")
async def root():
    return {"message": "🐍 Python FastAPI Backend is running!", "status": "success"}

@app.get("/api/dashboard/tables")
async def get_dashboard_tables():
    dashboard_tables = []
    for table in tables_db.values():
        bill = None
        for b in bills_db.values():
            if b["table_id"] == table["id"] and b["is_active"]:
                bill = b
                break
        
        table_items = [item for item in items_db.values() if bill and item["bill_id"] == bill["id"]]
        
        dashboard_tables.append({
            "id": table["id"],
            "number": table["number"],
            "restaurant_name": table["restaurant_name"],
            "bill": bill,
            "items": table_items,
            "guest_count": bill["guest_count"] if bill else 0,
            "start_time": bill["start_time"] if bill else None
        })
    
    return dashboard_tables

@app.get("/api/qr/{table_number}/{restaurant}")
async def get_bill_via_qr(table_number: int, restaurant: str):
    # Find table
    table = None
    for t in tables_db.values():
        if t["number"] == table_number and t["restaurant_name"] == restaurant:
            table = t
            break
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Find active bill
    bill = None
    for b in bills_db.values():
        if b["table_id"] == table["id"] and b["is_active"]:
            bill = b
            break
    
    if not bill:
        raise HTTPException(status_code=404, detail="No active bill for this table")
    
    # Get items
    bill_items = [item for item in items_db.values() if item["bill_id"] == bill["id"]]
    
    return {
        **bill,
        "items": bill_items,
        "table": table
    }

@app.get("/api/tables")
async def get_tables():
    return list(tables_db.values())

@app.post("/api/payments")
async def create_payment(payment_data: Dict[str, Any]):
    payment_id = str(uuid.uuid4())
    payment = {
        "id": payment_id,
        "processed_at": datetime.now().isoformat(),
        **payment_data
    }
    
    # Update bill
    bill_id = payment_data["bill_id"]
    if bill_id in bills_db:
        bill = bills_db[bill_id]
        total_amount = float(payment_data["amount"]) + float(payment_data.get("tip", "0"))
        new_paid = float(bill.get("paid", "0")) + total_amount
        new_remaining = float(bill["total"]) - new_paid
        
        status_value = "unpaid"
        if new_remaining <= 0:
            status_value = "paid"
        elif new_paid > 0:
            status_value = "partial"
        
        bills_db[bill_id].update({
            "paid": f"{new_paid:.2f}",
            "remaining": f"{max(0, new_remaining):.2f}",
            "status": status_value,
        })
        
        # Update item quantities
        for item_payment in payment_data.get("items", []):
            item_id = item_payment.get("itemId")
            quantity = item_payment.get("quantity", 0)
            
            if item_id in items_db:
                current_paid = float(items_db[item_id].get("paid_quantity", "0"))
                items_db[item_id]["paid_quantity"] = f"{current_paid + float(quantity):.2f}"
    
    return payment

if __name__ == "__main__":
    import uvicorn
    print("🐍 Starting simple Python FastAPI server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)