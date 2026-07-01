import { IInvoiceRepository, IInventoryRepository, IJournalRepository } from "../domain/interfaces.ts";
import { db } from "../../db/db.ts";

export class InvoiceService {
  constructor(
    private invoiceRepo: IInvoiceRepository,
    private inventoryRepo: IInventoryRepository,
    private journalRepo: IJournalRepository
  ) {}

  async createPurchaseInvoice(data: any) {
    const { partnerId, invoiceNumber, items: invoiceItems, totalAmount, notes } = data;
    
    return await db.transaction(async (tx) => {
      // 1. Create Header
      const headerData = {
        invoiceNumber: invoiceNumber || `PUR-${Date.now()}`,
        partnerId,
        type: 'purchase',
        totalAmount,
        notes
      };
      const invoice = await this.invoiceRepo.createInvoiceHeader(tx, headerData);
      
      // 2. Add Lines and Inventory
      for (const item of invoiceItems) {
        await this.invoiceRepo.createInvoiceLine(tx, {
          invoiceId: invoice.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        });

        await this.inventoryRepo.createTransaction(tx, {
          itemId: item.itemId,
          quantityChange: item.quantity,
          unit: 'tons',
          referenceId: invoice.id.toString(),
          referenceType: 'purchase_invoice',
          notes: `Purchase Invoice ${invoice.invoiceNumber}`
        });
      }

      // 3. Journal Entry
      await this.journalRepo.createEntry(tx, {
        referenceId: invoice.id.toString(),
        referenceType: 'purchase_invoice',
        description: `Purchase Invoice ${invoice.invoiceNumber} from Supplier`,
        date: new Date()
      });

      return invoice;
    });
  }

  async createSaleInvoice(data: any) {
    const { partnerId, invoiceNumber, items: invoiceItems, totalAmount, notes } = data;
    
    return await db.transaction(async (tx) => {
      // 1. Create Header
      const headerData = {
        invoiceNumber: invoiceNumber || `SAL-${Date.now()}`,
        partnerId,
        type: 'sale',
        totalAmount,
        notes
      };
      const invoice = await this.invoiceRepo.createInvoiceHeader(tx, headerData);

      // 2. Add Lines and Inventory (Outward)
      for (const item of invoiceItems) {
        await this.invoiceRepo.createInvoiceLine(tx, {
          invoiceId: invoice.id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice
        });

        await this.inventoryRepo.createTransaction(tx, {
          itemId: item.itemId,
          quantityChange: -item.quantity, // Negative for sales
          unit: 'pieces',
          referenceId: invoice.id.toString(),
          referenceType: 'sale_invoice',
          notes: `Sale Invoice ${invoice.invoiceNumber}`
        });
      }

      // 3. Journal Entry
      await this.journalRepo.createEntry(tx, {
        referenceId: invoice.id.toString(),
        referenceType: 'sale_invoice',
        description: `Sale Invoice ${invoice.invoiceNumber} to Client`,
        date: new Date()
      });

      return invoice;
    });
  }
}
