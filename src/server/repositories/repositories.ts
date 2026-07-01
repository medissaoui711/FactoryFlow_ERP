import { db } from "../../db/db.ts";
import { eq } from "drizzle-orm";
import { 
  invoices, invoiceLines, inventoryTransactions, journalEntries, journalLines,
  checks, expenses, accounts, productionOrders, partners, items
} from "../../db/schema.ts";
import { 
  IInvoiceRepository, IInventoryRepository, IJournalRepository,
  ICheckRepository, IExpenseRepository, ITreasuryRepository, IProductionOrderRepository
} from "../domain/interfaces.ts";

export class InvoiceRepository implements IInvoiceRepository {
  async createInvoiceHeader(tx: any, data: any): Promise<any> {
    const newInvoice = await tx.insert(invoices).values(data).returning();
    return newInvoice[0];
  }

  async createInvoiceLine(tx: any, data: any): Promise<any> {
    const newLine = await tx.insert(invoiceLines).values(data).returning();
    return newLine[0];
  }
}

export class InventoryRepository implements IInventoryRepository {
  async createTransaction(tx: any, data: any): Promise<any> {
    const newTx = await tx.insert(inventoryTransactions).values(data).returning();
    return newTx[0];
  }
}

export class JournalRepository implements IJournalRepository {
  async createEntry(tx: any, data: any): Promise<any> {
    const newEntry = await tx.insert(journalEntries).values(data).returning();
    return newEntry[0];
  }
  
  async createLine(tx: any, data: any): Promise<any> {
    const newLine = await tx.insert(journalLines).values(data).returning();
    return newLine[0];
  }
}

export class CheckRepository implements ICheckRepository {
  async getChecks(type?: string, status?: string): Promise<any[]> {
    let q = db.select({
      id: checks.id,
      checkNumber: checks.checkNumber,
      bankName: checks.bankName,
      amount: checks.amount,
      dueDate: checks.dueDate,
      status: checks.status,
      type: checks.type,
      partnerId: checks.partnerId,
      partnerName: partners.name
    })
    .from(checks)
    .leftJoin(partners, eq(checks.partnerId, partners.id));

    const results = await q;

    let finalResults = results;
    if (type) finalResults = finalResults.filter(r => r.type === type);
    if (status) finalResults = finalResults.filter(r => r.status === status);

    return finalResults;
  }

  async createCheck(tx: any, data: any): Promise<any> {
    const newCheck = await tx.insert(checks).values(data).returning();
    return newCheck[0];
  }

  async updateStatus(tx: any, id: number, status: string): Promise<any> {
    const updated = await tx.update(checks).set({ status }).where(eq(checks.id, id)).returning();
    return updated[0];
  }
}

export class ExpenseRepository implements IExpenseRepository {
  async getExpenses(): Promise<any[]> {
    const allExpenses = await db.execute(`
      SELECT 
        e.id,
        a.name as item,
        e.amount,
        e.description as statement,
        e.date
      FROM expenses e
      JOIN accounts a ON e.account_id = a.id
      ORDER BY e.date DESC
    `);
    return allExpenses.rows;
  }

  async createExpense(tx: any, data: any): Promise<any> {
    const newExpense = await tx.insert(expenses).values(data).returning();
    return newExpense[0];
  }
}

export class TreasuryRepository implements ITreasuryRepository {
  async getBalances(): Promise<any[]> {
    const balances = await db.execute(`
      SELECT 
        a.id as "accountId", 
        a.name as "accountName", 
        a.type as "accountType",
        COALESCE(SUM(jl.debit) - SUM(jl.credit), 0) as balance
      FROM accounts a
      LEFT JOIN journal_lines jl ON a.id = jl.account_id
      WHERE a.type IN ('treasury', 'bank')
      GROUP BY a.id, a.name, a.type
      ORDER BY a.type, a.name
    `);
    return balances.rows;
  }

  async getTransactions(): Promise<any[]> {
    const txs = await db.execute(`
      SELECT 
        jl.id,
        je.date,
        je.description as statement,
        a.name as "accountName",
        a.type as "accountType",
        jl.debit as incoming,
        jl.credit as outgoing
      FROM journal_lines jl
      JOIN journal_entries je ON jl.journal_entry_id = je.id
      JOIN accounts a ON jl.account_id = a.id
      WHERE a.type IN ('treasury', 'bank')
      ORDER BY je.date DESC
      LIMIT 100
    `);
    return txs.rows;
  }
}

export class ProductionOrderRepository implements IProductionOrderRepository {
  async getOrders(): Promise<any[]> {
    return await db.select().from(productionOrders);
  }

  async createOrder(tx: any, data: any): Promise<any> {
    const newOrder = await tx.insert(productionOrders).values(data).returning();
    return newOrder[0];
  }

  async updateStatus(tx: any, id: number, status: string): Promise<any> {
    const updated = await tx.update(productionOrders).set({ status }).where(eq(productionOrders.id, id)).returning();
    return updated[0];
  }

  async findOrCreateItem(tx: any, itemData: any): Promise<number> {
    let dbItem = await tx.select().from(items).where(eq(items.code, itemData.code)).limit(1);
    if (dbItem.length === 0) {
      const newItem = await tx.insert(items).values(itemData).returning();
      return newItem[0].id;
    }
    return dbItem[0].id;
  }
}
