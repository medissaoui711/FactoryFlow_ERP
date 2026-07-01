export interface IInvoiceRepository {
  createInvoiceHeader(tx: any, data: any): Promise<any>;
  createInvoiceLine(tx: any, data: any): Promise<any>;
}

export interface IInventoryRepository {
  createTransaction(tx: any, data: any): Promise<any>;
}

export interface IJournalRepository {
  createEntry(tx: any, data: any): Promise<any>;
  createLine(tx: any, data: any): Promise<any>;
}

export interface ICheckRepository {
  getChecks(type?: string, status?: string): Promise<any[]>;
  createCheck(tx: any, data: any): Promise<any>;
  updateStatus(tx: any, id: number, status: string): Promise<any>;
}

export interface IExpenseRepository {
  getExpenses(): Promise<any[]>;
  createExpense(tx: any, data: any): Promise<any>;
}

export interface ITreasuryRepository {
  getBalances(): Promise<any[]>;
  getTransactions(): Promise<any[]>;
}

export interface IProductionOrderRepository {
  getOrders(): Promise<any[]>;
  createOrder(tx: any, data: any): Promise<any>;
  updateStatus(tx: any, id: number, status: string): Promise<any>;
  findOrCreateItem(tx: any, itemData: any): Promise<number>;
}
