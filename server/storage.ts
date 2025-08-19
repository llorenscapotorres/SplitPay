import { type Table, type InsertTable, type Bill, type InsertBill, type BillItem, type InsertBillItem, type Payment, type InsertPayment, type BillWithItems, type DashboardTable } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Tables
  createTable(table: InsertTable): Promise<Table>;
  getTable(id: string): Promise<Table | undefined>;
  getTableByNumber(number: number, restaurantName: string): Promise<Table | undefined>;
  getAllTables(): Promise<Table[]>;
  updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined>;

  // Bills
  createBill(bill: InsertBill): Promise<Bill>;
  getBill(id: string): Promise<Bill | undefined>;
  getBillByTableId(tableId: string): Promise<Bill | undefined>;
  getBillWithItems(id: string): Promise<BillWithItems | undefined>;
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined>;
  getAllActiveBills(): Promise<Bill[]>;

  // Bill Items
  createBillItem(item: InsertBillItem): Promise<BillItem>;
  getBillItems(billId: string): Promise<BillItem[]>;
  updateBillItem(id: string, updates: Partial<BillItem>): Promise<BillItem | undefined>;
  getBillItem(id: string): Promise<BillItem | undefined>;

  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByBillId(billId: string): Promise<Payment[]>;

  // Dashboard
  getDashboardTables(): Promise<DashboardTable[]>;
}

export class MemStorage implements IStorage {
  private tables: Map<string, Table>;
  private bills: Map<string, Bill>;
  private billItems: Map<string, BillItem>;
  private payments: Map<string, Payment>;

  constructor() {
    this.tables = new Map();
    this.bills = new Map();
    this.billItems = new Map();
    this.payments = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample table
    const tableId = randomUUID();
    const table: Table = {
      id: tableId,
      number: 7,
      restaurantName: "Bella Vista Restaurant",
      qrCode: "https://splitbill.app/t/7/bella-vista",
      isActive: true,
      createdAt: new Date(),
    };
    this.tables.set(tableId, table);

    // Create sample bill
    const billId = randomUUID();
    const bill: Bill = {
      id: billId,
      tableId: tableId,
      total: "89.50",
      paid: "32.75",
      remaining: "56.75",
      status: "partial",
      guestCount: 4,
      startTime: new Date(),
      isActive: true,
    };
    this.bills.set(billId, bill);

    // Create sample bill items
    const items = [
      { name: "Caesar Salad", price: "18.50", quantity: "1", paidQuantity: "0" },
      { name: "Grilled Salmon", price: "32.00", quantity: "1", paidQuantity: "0" },
      { name: "Wine Bottle (Shared)", price: "45.00", quantity: "1", paidQuantity: "0.5" },
      { name: "Dessert", price: "12.00", quantity: "1", paidQuantity: "0" },
    ];

    items.forEach(item => {
      const itemId = randomUUID();
      const billItem: BillItem = {
        id: itemId,
        billId: billId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        paidQuantity: item.paidQuantity,
      };
      this.billItems.set(itemId, billItem);
    });

    // Add more sample tables for dashboard
    for (let i = 3; i <= 12; i++) {
      if (i === 7) continue; // Skip table 7 as it's already created
      
      const tId = randomUUID();
      const sampleTable: Table = {
        id: tId,
        number: i,
        restaurantName: "Bella Vista Restaurant",
        qrCode: `https://splitbill.app/t/${i}/bella-vista`,
        isActive: true,
        createdAt: new Date(),
      };
      this.tables.set(tId, sampleTable);

      // Create bills for some tables
      if (i === 3 || i === 5 || i === 12) {
        const bId = randomUUID();
        let status = "unpaid";
        let paid = "0";
        let remaining = "65.25";
        let total = "65.25";

        if (i === 3) {
          status = "paid";
          paid = "65.25";
          remaining = "0";
        } else if (i === 5) {
          status = "partial";
          paid = "45.60";
          remaining = "32.80";
          total = "78.40";
        } else if (i === 12) {
          status = "unpaid";
          paid = "0";
          remaining = "156.75";
          total = "156.75";
        }

        const sampleBill: Bill = {
          id: bId,
          tableId: tId,
          total,
          paid,
          remaining,
          status,
          guestCount: i === 3 ? 2 : i === 5 ? 3 : 6,
          startTime: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
          isActive: true,
        };
        this.bills.set(bId, sampleBill);
      }
    }
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const id = randomUUID();
    const table: Table = {
      ...insertTable,
      id,
      createdAt: new Date(),
    };
    this.tables.set(id, table);
    return table;
  }

  async getTable(id: string): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async getTableByNumber(number: number, restaurantName: string): Promise<Table | undefined> {
    return Array.from(this.tables.values()).find(
      table => table.number === number && table.restaurantName === restaurantName
    );
  }

  async getAllTables(): Promise<Table[]> {
    return Array.from(this.tables.values());
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined> {
    const table = this.tables.get(id);
    if (!table) return undefined;
    
    const updatedTable = { ...table, ...updates };
    this.tables.set(id, updatedTable);
    return updatedTable;
  }

  async createBill(insertBill: InsertBill): Promise<Bill> {
    const id = randomUUID();
    const bill: Bill = {
      ...insertBill,
      id,
      startTime: new Date(),
    };
    this.bills.set(id, bill);
    return bill;
  }

  async getBill(id: string): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async getBillByTableId(tableId: string): Promise<Bill | undefined> {
    return Array.from(this.bills.values()).find(bill => bill.tableId === tableId && bill.isActive);
  }

  async getBillWithItems(id: string): Promise<BillWithItems | undefined> {
    const bill = this.bills.get(id);
    if (!bill) return undefined;

    const items = Array.from(this.billItems.values()).filter(item => item.billId === id);
    const table = this.tables.get(bill.tableId);
    if (!table) return undefined;

    return { ...bill, items, table };
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined> {
    const bill = this.bills.get(id);
    if (!bill) return undefined;
    
    const updatedBill = { ...bill, ...updates };
    this.bills.set(id, updatedBill);
    return updatedBill;
  }

  async getAllActiveBills(): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(bill => bill.isActive);
  }

  async createBillItem(insertItem: InsertBillItem): Promise<BillItem> {
    const id = randomUUID();
    const item: BillItem = {
      ...insertItem,
      id,
    };
    this.billItems.set(id, item);
    return item;
  }

  async getBillItems(billId: string): Promise<BillItem[]> {
    return Array.from(this.billItems.values()).filter(item => item.billId === billId);
  }

  async updateBillItem(id: string, updates: Partial<BillItem>): Promise<BillItem | undefined> {
    const item = this.billItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates };
    this.billItems.set(id, updatedItem);
    return updatedItem;
  }

  async getBillItem(id: string): Promise<BillItem | undefined> {
    return this.billItems.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      processedAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentsByBillId(billId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.billId === billId);
  }

  async getDashboardTables(): Promise<DashboardTable[]> {
    const dashboardTables: DashboardTable[] = [];
    
    for (const table of this.tables.values()) {
      const bill = Array.from(this.bills.values()).find(b => b.tableId === table.id && b.isActive);
      const items = bill ? Array.from(this.billItems.values()).filter(item => item.billId === bill.id) : [];
      
      dashboardTables.push({
        id: table.id,
        number: table.number,
        restaurantName: table.restaurantName,
        bill: bill || null,
        items,
        guestCount: bill?.guestCount || 0,
        startTime: bill?.startTime || null,
      });
    }
    
    return dashboardTables.sort((a, b) => a.number - b.number);
  }
}

export const storage = new MemStorage();
