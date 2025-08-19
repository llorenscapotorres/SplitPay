#!/usr/bin/env python3
"""
Python FastAPI server to replace the Node.js Express server
"""
import sys
import os
from pathlib import Path

# Add server_python to path
server_python_path = Path(__file__).parent.parent / 'server_python'
sys.path.insert(0, str(server_python_path))

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles  
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

# Import our schemas and storage
from schemas import (
    Table, TableCreate, Bill, BillCreate, BillItem, BillItemCreate, 
    Payment, PaymentCreate, BillWithItems, DashboardTable
)
from storage import storage

app = FastAPI(title="SplitBill API", description="Restaurant group payment system API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
@app.get("/api/tables", response_model=List[Table])
async def get_tables():
    return await storage.get_all_tables()

@app.post("/api/tables", response_model=Table)
async def create_table(table_data: TableCreate):
    return await storage.create_table(table_data)

@app.get("/api/tables/{table_id}", response_model=Table)
async def get_table(table_id: str):
    table = await storage.get_table(table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

@app.get("/api/bills/table/{table_id}", response_model=BillWithItems)
async def get_bill_by_table_id(table_id: str):
    bill = await storage.get_bill_by_table_id(table_id)
    if not bill:
        raise HTTPException(status_code=404, detail="No active bill found for this table")
    bill_with_items = await storage.get_bill_with_items(bill.id)
    return bill_with_items

@app.get("/api/bills/{bill_id}", response_model=BillWithItems)
async def get_bill(bill_id: str):
    bill = await storage.get_bill_with_items(bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@app.post("/api/bills", response_model=Bill)
async def create_bill(bill_data: BillCreate):
    return await storage.create_bill(bill_data)

@app.patch("/api/bills/{bill_id}", response_model=Bill)
async def update_bill(bill_id: str, updates: Dict[str, Any]):
    bill = await storage.update_bill(bill_id, updates)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@app.get("/api/bills/{bill_id}/items", response_model=List[BillItem])
async def get_bill_items(bill_id: str):
    return await storage.get_bill_items(bill_id)

@app.post("/api/bills/{bill_id}/items", response_model=BillItem)
async def create_bill_item(bill_id: str, item_data: Dict[str, Any]):
    item_data["bill_id"] = bill_id
    item_create = BillItemCreate(**item_data)
    return await storage.create_bill_item(item_create)

@app.patch("/api/bill-items/{item_id}", response_model=BillItem)
async def update_bill_item(item_id: str, updates: Dict[str, Any]):
    item = await storage.update_bill_item(item_id, updates)
    if not item:
        raise HTTPException(status_code=404, detail="Bill item not found")
    return item

@app.post("/api/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate):
    payment = await storage.create_payment(payment_data)
    
    # Update bill with new payment
    bill = await storage.get_bill(payment_data.bill_id)
    if bill:
        total_amount = float(payment_data.amount) + float(payment_data.tip or "0")
        new_paid = float(bill.paid or "0") + total_amount
        new_remaining = float(bill.total) - new_paid
        
        status_value = "unpaid"
        if new_remaining <= 0:
            status_value = "paid"
        elif new_paid > 0:
            status_value = "partial"
        
        await storage.update_bill(bill.id, {
            "paid": f"{new_paid:.2f}",
            "remaining": f"{max(0, new_remaining):.2f}",
            "status": status_value,
        })
        
        # Update paid quantities for items
        if hasattr(payment_data.items, '__iter__') and payment_data.items:
            for item_payment in payment_data.items:
                if isinstance(item_payment, dict):
                    item_id = item_payment.get("itemId")
                    quantity = item_payment.get("quantity")
                    
                    if item_id and quantity:
                        bill_item = await storage.get_bill_item(item_id)
                        if bill_item:
                            new_paid_qty = float(bill_item.paid_quantity or "0") + float(quantity)
                            await storage.update_bill_item(item_id, {
                                "paid_quantity": f"{new_paid_qty:.2f}",
                            })
    
    return payment

@app.get("/api/payments/bill/{bill_id}", response_model=List[Payment])
async def get_payments_by_bill(bill_id: str):
    return await storage.get_payments_by_bill_id(bill_id)

@app.get("/api/dashboard/tables", response_model=List[DashboardTable])
async def get_dashboard_tables():
    return await storage.get_dashboard_tables()

@app.get("/api/qr/{table_number}/{restaurant}", response_model=BillWithItems)
async def get_bill_via_qr(table_number: int, restaurant: str):
    table = await storage.get_table_by_number(table_number, restaurant)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    bill = await storage.get_bill_by_table_id(table.id)
    if not bill:
        raise HTTPException(status_code=404, detail="No active bill for this table")
    
    bill_with_items = await storage.get_bill_with_items(bill.id)
    return bill_with_items

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "backend": "Python FastAPI"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"🐍 Starting Python FastAPI server on port {port}...")
    uvicorn.run("index_python:app", host="0.0.0.0", port=port, reload=True)