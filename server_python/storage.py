from typing import Dict, List, Optional
from datetime import datetime
import uuid
from schemas import Table, TableCreate, Bill, BillCreate, BillItem, BillItemCreate, Payment, PaymentCreate, BillWithItems, DashboardTable

class IStorage:
    """Abstract storage interface"""
    
    # Tables
    async def create_table(self, table: TableCreate) -> Table: ...
    async def get_table(self, id: str) -> Optional[Table]: ...
    async def get_table_by_number(self, number: int, restaurant_name: str) -> Optional[Table]: ...
    async def get_all_tables(self) -> List[Table]: ...
    async def update_table(self, id: str, updates: dict) -> Optional[Table]: ...
    
    # Bills
    async def create_bill(self, bill: BillCreate) -> Bill: ...
    async def get_bill(self, id: str) -> Optional[Bill]: ...
    async def get_bill_by_table_id(self, table_id: str) -> Optional[Bill]: ...
    async def get_bill_with_items(self, id: str) -> Optional[BillWithItems]: ...
    async def update_bill(self, id: str, updates: dict) -> Optional[Bill]: ...
    async def get_all_active_bills(self) -> List[Bill]: ...
    
    # Bill Items
    async def create_bill_item(self, item: BillItemCreate) -> BillItem: ...
    async def get_bill_items(self, bill_id: str) -> List[BillItem]: ...
    async def update_bill_item(self, id: str, updates: dict) -> Optional[BillItem]: ...
    async def get_bill_item(self, id: str) -> Optional[BillItem]: ...
    
    # Payments
    async def create_payment(self, payment: PaymentCreate) -> Payment: ...
    async def get_payments_by_bill_id(self, bill_id: str) -> List[Payment]: ...
    
    # Dashboard
    async def get_dashboard_tables(self) -> List[DashboardTable]: ...

class MemStorage(IStorage):
    """In-memory storage implementation"""
    
    def __init__(self):
        self.tables: Dict[str, Table] = {}
        self.bills: Dict[str, Bill] = {}
        self.bill_items: Dict[str, BillItem] = {}
        self.payments: Dict[str, Payment] = {}
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize with sample data"""
        # Create sample table
        table_id = str(uuid.uuid4())
        table = Table(
            id=table_id,
            number=7,
            restaurant_name="bella-vista",
            qr_code="https://splitbill.app/t/7/bella-vista",
            is_active=True,
            created_at=datetime.now()
        )
        self.tables[table_id] = table
        
        # Create sample bill
        bill_id = str(uuid.uuid4())
        bill = Bill(
            id=bill_id,
            table_id=table_id,
            total="89.50",
            paid="32.75",
            remaining="56.75",
            status="partial",
            guest_count=4,
            start_time=datetime.now(),
            is_active=True
        )
        self.bills[bill_id] = bill
        
        # Create sample bill items
        items_data = [
            {"name": "Caesar Salad", "price": "18.50", "quantity": "1", "paid_quantity": "0"},
            {"name": "Grilled Salmon", "price": "32.00", "quantity": "1", "paid_quantity": "0"},
            {"name": "Wine Bottle (Shared)", "price": "45.00", "quantity": "1", "paid_quantity": "0.5"},
            {"name": "Dessert", "price": "12.00", "quantity": "1", "paid_quantity": "0"},
        ]
        
        for item_data in items_data:
            item_id = str(uuid.uuid4())
            item = BillItem(
                id=item_id,
                bill_id=bill_id,
                name=item_data["name"],
                price=item_data["price"],
                quantity=item_data["quantity"],
                paid_quantity=item_data["paid_quantity"]
            )
            self.bill_items[item_id] = item
        
        # Add more sample tables for dashboard
        for i in range(3, 13):
            if i == 7:  # Skip table 7 as it's already created
                continue
            
            t_id = str(uuid.uuid4())
            sample_table = Table(
                id=t_id,
                number=i,
                restaurant_name="bella-vista",
                qr_code=f"https://splitbill.app/t/{i}/bella-vista",
                is_active=True,
                created_at=datetime.now()
            )
            self.tables[t_id] = sample_table
            
            # Create bills for some tables
            if i in [3, 5, 12]:
                b_id = str(uuid.uuid4())
                status = "unpaid"
                paid = "0"
                remaining = "65.25"
                total = "65.25"
                
                if i == 3:
                    status = "paid"
                    paid = "65.25"
                    remaining = "0"
                elif i == 5:
                    status = "partial"
                    paid = "45.60"
                    remaining = "32.80"
                    total = "78.40"
                elif i == 12:
                    status = "unpaid"
                    paid = "0"
                    remaining = "156.75"
                    total = "156.75"
                
                sample_bill = Bill(
                    id=b_id,
                    table_id=t_id,
                    total=total,
                    paid=paid,
                    remaining=remaining,
                    status=status,
                    guest_count=2 if i == 3 else 3 if i == 5 else 6,
                    start_time=datetime.now(),
                    is_active=True
                )
                self.bills[b_id] = sample_bill
    
    async def create_table(self, table: TableCreate) -> Table:
        table_id = str(uuid.uuid4())
        table = Table(
            id=table_id,
            created_at=datetime.now(),
            **table.model_dump()
        )
        self.tables[table_id] = table
        return table
    
    async def get_table(self, id: str) -> Optional[Table]:
        return self.tables.get(id)
    
    async def get_table_by_number(self, number: int, restaurant_name: str) -> Optional[Table]:
        for table in self.tables.values():
            if table.number == number and table.restaurant_name == restaurant_name:
                return table
        return None
    
    async def get_all_tables(self) -> List[Table]:
        return list(self.tables.values())
    
    async def update_table(self, id: str, updates: dict) -> Optional[Table]:
        table = self.tables.get(id)
        if not table:
            return None
        
        for key, value in updates.items():
            if hasattr(table, key):
                setattr(table, key, value)
        
        self.tables[id] = table
        return table
    
    async def create_bill(self, bill: BillCreate) -> Bill:
        bill_id = str(uuid.uuid4())
        bill = Bill(
            id=bill_id,
            start_time=datetime.now(),
            **bill.model_dump()
        )
        self.bills[bill_id] = bill
        return bill
    
    async def get_bill(self, id: str) -> Optional[Bill]:
        return self.bills.get(id)
    
    async def get_bill_by_table_id(self, table_id: str) -> Optional[Bill]:
        for bill in self.bills.values():
            if bill.table_id == table_id and bill.is_active:
                return bill
        return None
    
    async def get_bill_with_items(self, id: str) -> Optional[BillWithItems]:
        bill = self.bills.get(id)
        if not bill:
            return None
        
        items = [item for item in self.bill_items.values() if item.bill_id == id]
        table = self.tables.get(bill.table_id)
        if not table:
            return None
        
        return BillWithItems(
            **bill.model_dump(),
            items=items,
            table=table
        )
    
    async def update_bill(self, id: str, updates: dict) -> Optional[Bill]:
        bill = self.bills.get(id)
        if not bill:
            return None
        
        for key, value in updates.items():
            if hasattr(bill, key):
                setattr(bill, key, value)
        
        self.bills[id] = bill
        return bill
    
    async def get_all_active_bills(self) -> List[Bill]:
        return [bill for bill in self.bills.values() if bill.is_active]
    
    async def create_bill_item(self, item: BillItemCreate) -> BillItem:
        item_id = str(uuid.uuid4())
        item = BillItem(
            id=item_id,
            **item.model_dump()
        )
        self.bill_items[item_id] = item
        return item
    
    async def get_bill_items(self, bill_id: str) -> List[BillItem]:
        return [item for item in self.bill_items.values() if item.bill_id == bill_id]
    
    async def update_bill_item(self, id: str, updates: dict) -> Optional[BillItem]:
        item = self.bill_items.get(id)
        if not item:
            return None
        
        for key, value in updates.items():
            if hasattr(item, key):
                setattr(item, key, value)
        
        self.bill_items[id] = item
        return item
    
    async def get_bill_item(self, id: str) -> Optional[BillItem]:
        return self.bill_items.get(id)
    
    async def create_payment(self, payment: PaymentCreate) -> Payment:
        payment_id = str(uuid.uuid4())
        payment = Payment(
            id=payment_id,
            processed_at=datetime.now(),
            **payment.model_dump()
        )
        self.payments[payment_id] = payment
        return payment
    
    async def get_payments_by_bill_id(self, bill_id: str) -> List[Payment]:
        return [payment for payment in self.payments.values() if payment.bill_id == bill_id]
    
    async def get_dashboard_tables(self) -> List[DashboardTable]:
        dashboard_tables = []
        
        for table in self.tables.values():
            bill = None
            for b in self.bills.values():
                if b.table_id == table.id and b.is_active:
                    bill = b
                    break
            
            items = []
            if bill:
                items = [item for item in self.bill_items.values() if item.bill_id == bill.id]
            
            dashboard_tables.append(DashboardTable(
                id=table.id,
                number=table.number,
                restaurant_name=table.restaurant_name,
                bill=bill,
                items=items,
                guest_count=bill.guest_count or 0 if bill else 0,
                start_time=bill.start_time if bill else None
            ))
        
        # Sort by table number
        dashboard_tables.sort(key=lambda x: x.number)
        return dashboard_tables

# Global storage instance
storage = MemStorage()