import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTableSchema, insertBillSchema, insertBillItemSchema, insertPaymentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tables
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getAllTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      res.status(201).json(table);
    } catch (error) {
      res.status(400).json({ message: "Invalid table data" });
    }
  });

  app.get("/api/tables/:id", async (req, res) => {
    try {
      const table = await storage.getTable(req.params.id);
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table" });
    }
  });

  // Bills
  app.get("/api/bills/table/:tableId", async (req, res) => {
    try {
      const bill = await storage.getBillByTableId(req.params.tableId);
      if (!bill) {
        return res.status(404).json({ message: "No active bill found for this table" });
      }
      const billWithItems = await storage.getBillWithItems(bill.id);
      res.json(billWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.get("/api/bills/:id", async (req, res) => {
    try {
      const bill = await storage.getBillWithItems(req.params.id);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const validatedData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(validatedData);
      res.status(201).json(bill);
    } catch (error) {
      res.status(400).json({ message: "Invalid bill data" });
    }
  });

  app.patch("/api/bills/:id", async (req, res) => {
    try {
      const bill = await storage.updateBill(req.params.id, req.body);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bill" });
    }
  });

  // Bill Items
  app.get("/api/bills/:billId/items", async (req, res) => {
    try {
      const items = await storage.getBillItems(req.params.billId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill items" });
    }
  });

  app.post("/api/bills/:billId/items", async (req, res) => {
    try {
      const validatedData = insertBillItemSchema.parse({
        ...req.body,
        billId: req.params.billId,
      });
      const item = await storage.createBillItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid bill item data" });
    }
  });

  app.patch("/api/bill-items/:id", async (req, res) => {
    try {
      const item = await storage.updateBillItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Bill item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bill item" });
    }
  });

  // Payments
  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      
      // Update bill with new payment
      const bill = await storage.getBill(validatedData.billId);
      if (bill) {
        const totalAmount = parseFloat(validatedData.amount) + parseFloat(validatedData.tip || "0");
        const newPaid = parseFloat(bill.paid) + totalAmount;
        const newRemaining = parseFloat(bill.total) - newPaid;
        
        let status = "unpaid";
        if (newRemaining <= 0) {
          status = "paid";
        } else if (newPaid > 0) {
          status = "partial";
        }

        await storage.updateBill(bill.id, {
          paid: newPaid.toFixed(2),
          remaining: Math.max(0, newRemaining).toFixed(2),
          status,
        });

        // Update paid quantities for items
        if (Array.isArray(validatedData.items)) {
          for (const itemPayment of validatedData.items as any[]) {
            const billItem = await storage.getBillItem(itemPayment.itemId);
            if (billItem) {
              const newPaidQty = parseFloat(billItem.paidQuantity) + parseFloat(itemPayment.quantity);
              await storage.updateBillItem(itemPayment.itemId, {
                paidQuantity: newPaidQty.toFixed(2),
              });
            }
          }
        }
      }
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.get("/api/payments/bill/:billId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByBillId(req.params.billId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Dashboard
  app.get("/api/dashboard/tables", async (req, res) => {
    try {
      const tables = await storage.getDashboardTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // QR Code routes
  app.get("/api/qr/:tableNumber/:restaurant", async (req, res) => {
    try {
      const { tableNumber, restaurant } = req.params;
      const table = await storage.getTableByNumber(parseInt(tableNumber), restaurant);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      const bill = await storage.getBillByTableId(table.id);
      if (!bill) {
        return res.status(404).json({ message: "No active bill for this table" });
      }

      const billWithItems = await storage.getBillWithItems(bill.id);
      res.json(billWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill via QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
