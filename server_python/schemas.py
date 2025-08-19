from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime
import uuid

# Table Models
class TableBase(BaseModel):
    number: int
    restaurant_name: str
    qr_code: str
    is_active: Optional[bool] = True

class Table(TableBase):
    id: str
    created_at: Optional[datetime] = None

class TableCreate(TableBase):
    pass

# Bill Models  
class BillBase(BaseModel):
    table_id: str
    total: str
    paid: Optional[str] = "0"
    remaining: str
    status: Optional[str] = "unpaid"  # 'unpaid', 'partial', 'paid'
    guest_count: Optional[int] = 1
    is_active: Optional[bool] = True

class Bill(BillBase):
    id: str
    start_time: Optional[datetime] = None

class BillCreate(BillBase):
    pass

# Bill Item Models
class BillItemBase(BaseModel):
    bill_id: str
    name: str
    price: str
    quantity: str = "1"
    paid_quantity: Optional[str] = "0"

class BillItem(BillItemBase):
    id: str

class BillItemCreate(BillItemBase):
    pass

# Payment Models
class PaymentBase(BaseModel):
    bill_id: str
    amount: str
    tip: Optional[str] = "0"
    items: Any  # JSON data for payment items
    payment_method: Optional[str] = "card"
    status: Optional[str] = "completed"

class Payment(PaymentBase):
    id: str
    processed_at: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

# Combined Models
class BillWithItems(Bill):
    items: List[BillItem]
    table: Table

class DashboardTable(BaseModel):
    id: str
    number: int
    restaurant_name: str
    bill: Optional[Bill] = None
    items: List[BillItem] = []
    guest_count: int = 0
    start_time: Optional[datetime] = None