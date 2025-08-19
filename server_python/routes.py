from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from storage import storage
from schemas import Table, TableCreate, Bill, BillCreate, BillItem, BillItemCreate, Payment, PaymentCreate, BillWithItems, DashboardTable

app = FastAPI(title="SplitBill API", description="Restaurant group payment system API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tables endpoints
@app.get("/api/tables", response_model=List[Table])
async def get_tables():
    """Get all tables"""
    try:
        return await storage.get_all_tables()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch tables")

@app.post("/api/tables", response_model=Table, status_code=status.HTTP_201_CREATED)
async def create_table(table_data: TableCreate):
    """Create a new table"""
    try:
        return await storage.create_table(table_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid table data")

@app.get("/api/tables/{table_id}", response_model=Table)
async def get_table(table_id: str):
    """Get a table by ID"""
    try:
        table = await storage.get_table(table_id)
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        return table
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch table")

# Bills endpoints
@app.get("/api/bills/table/{table_id}", response_model=BillWithItems)
async def get_bill_by_table_id(table_id: str):
    """Get active bill for a table"""
    try:
        bill = await storage.get_bill_by_table_id(table_id)
        if not bill:
            raise HTTPException(status_code=404, detail="No active bill found for this table")
        
        bill_with_items = await storage.get_bill_with_items(bill.id)
        return bill_with_items
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch bill")

@app.get("/api/bills/{bill_id}", response_model=BillWithItems)
async def get_bill(bill_id: str):
    """Get a bill with items by ID"""
    try:
        bill = await storage.get_bill_with_items(bill_id)
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        return bill
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch bill")

@app.post("/api/bills", response_model=Bill, status_code=status.HTTP_201_CREATED)
async def create_bill(bill_data: BillCreate):
    """Create a new bill"""
    try:
        return await storage.create_bill(bill_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid bill data")

@app.patch("/api/bills/{bill_id}", response_model=Bill)
async def update_bill(bill_id: str, updates: Dict[str, Any]):
    """Update a bill"""
    try:
        bill = await storage.update_bill(bill_id, updates)
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        return bill
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update bill")

# Bill Items endpoints
@app.get("/api/bills/{bill_id}/items", response_model=List[BillItem])
async def get_bill_items(bill_id: str):
    """Get all items for a bill"""
    try:
        return await storage.get_bill_items(bill_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch bill items")

@app.post("/api/bills/{bill_id}/items", response_model=BillItem, status_code=status.HTTP_201_CREATED)
async def create_bill_item(bill_id: str, item_data: Dict[str, Any]):
    """Create a new bill item"""
    try:
        item_data["bill_id"] = bill_id
        item_create = BillItemCreate(**item_data)
        return await storage.create_bill_item(item_create)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid bill item data")

@app.patch("/api/bill-items/{item_id}", response_model=BillItem)
async def update_bill_item(item_id: str, updates: Dict[str, Any]):
    """Update a bill item"""
    try:
        item = await storage.update_bill_item(item_id, updates)
        if not item:
            raise HTTPException(status_code=404, detail="Bill item not found")
        return item
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update bill item")

# Payments endpoints
@app.post("/api/payments", response_model=Payment, status_code=status.HTTP_201_CREATED)
async def create_payment(payment_data: PaymentCreate):
    """Create a new payment"""
    try:
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
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid payment data")

@app.get("/api/payments/bill/{bill_id}", response_model=List[Payment])
async def get_payments_by_bill(bill_id: str):
    """Get all payments for a bill"""
    try:
        return await storage.get_payments_by_bill_id(bill_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch payments")

# Dashboard endpoints  
@app.get("/api/dashboard/tables", response_model=List[DashboardTable])
async def get_dashboard_tables():
    """Get dashboard data for all tables"""
    try:
        return await storage.get_dashboard_tables()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard data")

# QR Code endpoints
@app.get("/api/qr/{table_number}/{restaurant}", response_model=BillWithItems)
async def get_bill_via_qr(table_number: int, restaurant: str):
    """Get bill via QR code scan"""
    try:
        table = await storage.get_table_by_number(table_number, restaurant)
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")
        
        bill = await storage.get_bill_by_table_id(table.id)
        if not bill:
            raise HTTPException(status_code=404, detail="No active bill for this table")
        
        bill_with_items = await storage.get_bill_with_items(bill.id)
        return bill_with_items
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to fetch bill via QR code")