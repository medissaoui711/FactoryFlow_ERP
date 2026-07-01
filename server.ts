import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { requireRole } from "./src/middleware/rbac.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import { db } from "./src/db/db.ts";
import { items, inventoryTransactions, accounts, productionOrders, journalEntries, journalLines, partners, invoices, invoiceLines, checks, expenses, purchaseOrders, purchaseOrderLines } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
import { 
  InvoiceRepository, InventoryRepository, JournalRepository,
  CheckRepository, ExpenseRepository, TreasuryRepository,
  ProductionOrderRepository
} from "./src/server/repositories/repositories.ts";
import { InvoiceService } from "./src/server/services/InvoiceService.ts";
import { CheckService } from "./src/server/services/CheckService.ts";
import { ExpenseService } from "./src/server/services/ExpenseService.ts";
import { TreasuryService } from "./src/server/services/TreasuryService.ts";

import { ProductionService } from "./src/server/services/ProductionService.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth test / Sync
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res): Promise<any> => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const user = await getOrCreateUser(req.user.uid, req.user.email || "", req.user.name);
      return res.json({ user });
    } catch (error: any) {
      console.error("Auth sync error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dependency Injection Setup
  const invoiceRepo = new InvoiceRepository();
  const inventoryRepo = new InventoryRepository();
  const journalRepo = new JournalRepository();
  const checkRepo = new CheckRepository();
  const expenseRepo = new ExpenseRepository();
  const treasuryRepo = new TreasuryRepository();
  const productionRepo = new ProductionOrderRepository();

  const invoiceService = new InvoiceService(invoiceRepo, inventoryRepo, journalRepo);
  const checkService = new CheckService(checkRepo, journalRepo);
  const expenseService = new ExpenseService(expenseRepo, journalRepo);
  const treasuryService = new TreasuryService(treasuryRepo, journalRepo);
  const productionService = new ProductionService(productionRepo, inventoryRepo, journalRepo);

  // Treasury & Accounts
  app.get("/api/accounts", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const type = req.query.type as string;
      const conditions = type ? eq(accounts.type, type) : undefined;
      const allAccounts = await db.select().from(accounts).where(conditions);
      return res.json(allAccounts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/accounts", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { name, type } = req.body;
      const newAccount = await db.insert(accounts).values({
        name,
        type
      }).returning();
      return res.json(newAccount[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/treasury/balances", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const balances = await treasuryService.getBalances();
      return res.json(balances);
    } catch (error: any) {
      console.error("Error calculating treasury balances:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/transaction", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const jEntry = await treasuryService.createTransaction(req.body);
      return res.json(jEntry);
    } catch (error: any) {
      console.error("Error creating treasury transaction:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/treasury/transactions", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const transactions = await treasuryService.getTransactions();
      return res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching treasury transactions:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Checks
  app.get("/api/checks", requireAuth, requireRole(['accountant', 'sales', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const type = req.query.type as string; // 'payable' | 'receivable'
      const status = req.query.status as string;
      const results = await checkService.getChecks(type, status);
      return res.json(results);
    } catch (error: any) {
      console.error("Error fetching checks:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/checks", requireAuth, requireRole(['accountant', 'sales', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const newCheck = await checkService.createCheck(req.body);
      return res.json(newCheck);
    } catch (error: any) {
      console.error("Error creating check:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/checks/:id/status", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { status } = req.body;
      const updated = await checkService.updateStatus(parseInt(req.params.id), status);
      return res.json(updated);
    } catch (error: any) {
      console.error("Error updating check status:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Expenses
  app.get("/api/expenses", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const expensesList = await expenseService.getExpenses();
      return res.json(expensesList);
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const newExpense = await expenseService.createExpense(req.body);
      return res.json(newExpense);
    } catch (error: any) {
      console.error("Error creating expense:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Journal Entries
  app.get("/api/journal", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const entries = await db.select().from(journalEntries).orderBy(journalEntries.id); // Or order by date
      const lines = await db.select({
        id: journalLines.id,
        journalEntryId: journalLines.journalEntryId,
        accountId: journalLines.accountId,
        accountName: accounts.name,
        debit: journalLines.debit,
        credit: journalLines.credit
      }).from(journalLines).leftJoin(accounts, eq(journalLines.accountId, accounts.id));

      const entriesWithLines = entries.map(entry => ({
        ...entry,
        lines: lines.filter(l => l.journalEntryId === entry.id)
      })).reverse(); // latest first

      return res.json(entriesWithLines);
    } catch (error: any) {
      console.error("Error fetching journal entries:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/journal", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { description, lines } = req.body;
      return await db.transaction(async (tx) => {
        const jEntry = await tx.insert(journalEntries).values({
          referenceType: 'manual',
          description: description || 'قيد تسوية يدوي',
          date: new Date()
        }).returning();

        for (const line of lines) {
          await tx.insert(journalLines).values({
            journalEntryId: jEntry[0].id,
            accountId: parseInt(line.accountId),
            debit: line.debit,
            credit: line.credit
          });
        }

        return res.json(jEntry[0]);
      });
    } catch (error: any) {
      console.error("Error creating journal entry:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Reports - Trial Balance
  app.get("/api/reports/trial-balance", requireAuth, requireRole(['accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const trialBalance = await db.execute(`
        SELECT 
          a.id as "accountId", 
          a.name as "accountName", 
          a.type as "accountType",
          COALESCE(SUM(jl.debit), 0) as "totalDebit",
          COALESCE(SUM(jl.credit), 0) as "totalCredit"
        FROM accounts a
        LEFT JOIN journal_lines jl ON a.id = jl.account_id
        GROUP BY a.id, a.name, a.type
        HAVING COALESCE(SUM(jl.debit), 0) > 0 OR COALESCE(SUM(jl.credit), 0) > 0
        ORDER BY a.type, a.name
      `);

      return res.json(trialBalance.rows);
    } catch (error: any) {
      console.error("Error fetching trial balance:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Partners
  app.get("/api/partners", requireAuth, requireRole(['sales', 'accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const type = req.query.type as string;
      const conditions = type ? eq(partners.type, type) : undefined;
      const allPartners = await db.select().from(partners).where(conditions);
      return res.json(allPartners);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/partners", requireAuth, requireRole(['sales', 'accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { name, type, phone, address } = req.body;
      const newPartner = await db.insert(partners).values({
        name,
        type,
        phone,
        address
      }).returning();
      return res.json(newPartner[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Purchase Orders
  app.get("/api/purchase-orders", requireAuth, requireRole(['sales', 'accountant', 'admin', 'warehouse', 'production']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const orders = await db.execute(`
        SELECT po.*, p.name as supplier_name 
        FROM purchase_orders po
        JOIN partners p ON po.partner_id = p.id
        ORDER BY po.created_at DESC
      `);
      return res.json(orders.rows);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/purchase-orders/:id", requireAuth, requireRole(['sales', 'accountant', 'admin', 'warehouse', 'production']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { id } = req.params;
      const orderRes = await db.execute(`
        SELECT po.*, p.name as supplier_name 
        FROM purchase_orders po
        JOIN partners p ON po.partner_id = p.id
        WHERE po.id = $1
      `, [id]);
      
      if (orderRes.rows.length === 0) return res.status(404).json({ error: "Order not found" });
      
      const linesRes = await db.execute(`
        SELECT pol.*, i.name as item_name, i.code as item_code
        FROM purchase_order_lines pol
        JOIN items i ON pol.item_id = i.id
        WHERE pol.purchase_order_id = $1
      `, [id]);
      
      return res.json({ ...orderRes.rows[0], lines: linesRes.rows });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/purchase-orders", requireAuth, requireRole(['sales', 'accountant', 'admin', 'warehouse']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { partnerId, orderNumber, notes, items: orderItems, totalAmount } = req.body;
      
      const newOrder = await db.insert(purchaseOrders).values({
        orderNumber: orderNumber || `PO-${Date.now()}`,
        partnerId,
        notes,
        totalAmount,
        status: 'pending_approval' // default
      }).returning();
      
      const poId = newOrder[0].id;
      
      for (const item of orderItems) {
        await db.insert(purchaseOrderLines).values({
          purchaseOrderId: poId,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          receivedQuantity: 0
        });
      }
      
      return res.json(newOrder[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/purchase-orders/:id/approve", requireAuth, requireRole(['admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { id } = req.params;
      const updated = await db.execute(`UPDATE purchase_orders SET status = 'approved' WHERE id = $1 RETURNING *`, [id]);
      return res.json(updated.rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/purchase-orders/:id/receive", requireAuth, requireRole(['admin', 'warehouse']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { id } = req.params;
      const { items: receivedItems } = req.body; // array of { lineId, quantity }
      
      for (const item of receivedItems) {
        // Update line received quantity
        await db.execute(`
          UPDATE purchase_order_lines 
          SET received_quantity = received_quantity + $1 
          WHERE id = $2
        `, [item.quantity, item.lineId]);
        
        // Get line details for inventory update
        const line = await db.execute(`SELECT * FROM purchase_order_lines WHERE id = $1`, [item.lineId]);
        const itemId = line.rows[0].item_id;
        
        // Add to inventory transactions
        await db.insert(inventoryTransactions).values({
          itemId: itemId,
          type: 'in',
          quantity: item.quantity,
          referenceId: id,
          referenceType: 'purchase_order',
          notes: 'Received from PO'
        });
      }
      
      // Update PO status if all received
      await db.execute(`
        UPDATE purchase_orders 
        SET status = CASE 
          WHEN (SELECT SUM(quantity) FROM purchase_order_lines WHERE purchase_order_id = $1) <= (SELECT SUM(received_quantity) FROM purchase_order_lines WHERE purchase_order_id = $1)
          THEN 'received'
          ELSE 'approved'
        END
        WHERE id = $1
      `, [id]);
      
      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Invoices (Purchases)
  app.post("/api/invoices/purchase", requireAuth, requireRole(['warehouse', 'accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const invoice = await invoiceService.createPurchaseInvoice(req.body);
      return res.json(invoice);
    } catch (error: any) {
      console.error("Error creating purchase invoice:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Invoices (Sales)
  app.post("/api/invoices/sale", requireAuth, requireRole(['sales', 'accountant', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const invoice = await invoiceService.createSaleInvoice(req.body);
      return res.json(invoice);
    } catch (error: any) {
      console.error("Error creating sale invoice:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Items
  app.get("/api/items", requireAuth, requireRole(['warehouse', 'production', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const allItems = await db.select().from(items);
      return res.json(allItems);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/items", requireAuth, requireRole(['warehouse', 'production', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { code, name, type, thickness, size } = req.body;
      const newItem = await db.insert(items).values({
        code,
        name,
        type,
        thickness,
        size
      }).returning();
      return res.json(newItem[0]);
    } catch (error: any) {
      console.error("Error creating item:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Inventory Transactions
  app.post("/api/inventory/opening-balance", requireAuth, requireRole(['warehouse', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const { itemId, quantity, unit, notes } = req.body;
      const newTransaction = await db.insert(inventoryTransactions).values({
        itemId,
        quantityChange: quantity, // positive for opening balance
        unit,
        referenceType: 'opening_balance',
        notes: notes || 'Opening Balance'
      }).returning();
      return res.json(newTransaction[0]);
    } catch (error: any) {
      console.error("Error setting opening balance:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inventory/balance", requireAuth, requireRole(['warehouse', 'production', 'sales', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      // Calculate current balance for each item by summing up quantity changes
      const balances = await db.execute(`
        SELECT 
          i.id as "itemId", 
          i.code, 
          i.name, 
          i.type,
          i.thickness,
          i.size,
          COALESCE(SUM(t.quantity_change), 0) as balance,
          MAX(t.unit) as unit
        FROM items i
        LEFT JOIN inventory_transactions t ON i.id = t.item_id
        GROUP BY i.id
      `);
      return res.json(balances.rows);
    } catch (error: any) {
      console.error("Error calculating inventory balances:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Production Orders
  app.post("/api/production/cutting-orders", requireAuth, requireRole(['production', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const order = await productionService.createCuttingOrder(req.body);
      return res.json(order);
    } catch (error: any) {
      console.error("Error saving cutting order:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inventory/items/:id/ledger", requireAuth, requireRole(['warehouse', 'admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const itemId = parseInt(req.params.id);
      
      const itemDetails = await db.execute(`
        SELECT 
          i.id as "itemId", 
          i.code, 
          i.name, 
          i.type,
          i.thickness,
          i.size,
          COALESCE(SUM(t.quantity_change), 0) as balance,
          MAX(t.unit) as unit
        FROM items i
        LEFT JOIN inventory_transactions t ON i.id = t.item_id
        WHERE i.id = ${itemId}
        GROUP BY i.id
      `);

      if (itemDetails.rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      const transactions = await db.execute(`
        SELECT 
          t.id,
          t.quantity_change as "quantityChange",
          t.unit,
          t.reference_id as "referenceId",
          t.reference_type as "referenceType",
          t.notes,
          t.created_at as "createdAt"
        FROM inventory_transactions t
        WHERE t.item_id = ${itemId}
        ORDER BY t.created_at DESC
      `);

      return res.json({
        item: itemDetails.rows[0],
        transactions: transactions.rows
      });
    } catch (error: any) {
      console.error("Error fetching item ledger:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/auth/me", requireAuth, requireRole(['admin', 'accountant', 'warehouse', 'production', 'sales']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const authReq = req as any;
      return res.json({ user: authReq.dbUser });
    } catch (error: any) {
      console.error("Auth me error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dashboard", requireAuth, requireRole(['admin', 'accountant', 'warehouse', 'production', 'sales']), async (req: AuthRequest, res): Promise<any> => {
    try {
      const authReq = req as any;
      const role = authReq.dbUser.role;

      const data: any = { role };

      // Gather some generic stats based on role
      if (['admin', 'accountant'].includes(role)) {
        // Treasury balance
        const treasury = await db.execute(`
          SELECT SUM(jl.debit - jl.credit) as total 
          FROM journal_lines jl 
          JOIN accounts a ON jl.account_id = a.id 
          WHERE a.type = 'treasury'
        `);
        data.totalTreasury = treasury.rows[0]?.total || 0;
        
        // Open checks
        const checksRes = await db.execute(`SELECT COUNT(*) as count FROM checks WHERE status = 'in_drawer' OR status = 'issued'`);
        data.openChecks = checksRes.rows[0]?.count || 0;
      }

      if (['admin', 'warehouse', 'production'].includes(role)) {
        // Total items
        const itemsRes = await db.execute(`SELECT COUNT(*) as count FROM items`);
        data.totalItems = itemsRes.rows[0]?.count || 0;

        // Active production orders (if any)
        const prodRes = await db.execute(`SELECT COUNT(*) as count FROM production_orders WHERE status = 'in_progress'`);
        data.activeProduction = prodRes.rows[0]?.count || 0;
      }

      if (['admin', 'sales'].includes(role)) {
        const salesRes = await db.execute(`SELECT COUNT(*) as count FROM invoices WHERE type = 'sale'`);
        data.totalSales = salesRes.rows[0]?.count || 0;
      }

      return res.json(data);
    } catch (error: any) {
      console.error("Dashboard error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit", requireAuth, requireRole(['admin']), async (req: AuthRequest, res): Promise<any> => {
    try {
      // Return recent journals as audit for now
      const journalsRes = await db.execute(`
        SELECT id, reference_id, reference_type, description, created_at
        FROM journal_entries
        ORDER BY created_at DESC
        LIMIT 20
      `);
      return res.json({ auditLogs: journalsRes.rows });
    } catch (error: any) {
      console.error("Audit error:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
