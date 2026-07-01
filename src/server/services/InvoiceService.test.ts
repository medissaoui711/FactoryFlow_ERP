import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceService } from './InvoiceService';

vi.mock('../../db/db.ts', () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback({});
    })
  }
}));

describe('InvoiceService', () => {
  let invoiceRepo: any;
  let inventoryRepo: any;
  let journalRepo: any;
  let service: InvoiceService;

  beforeEach(() => {
    invoiceRepo = {
      createInvoiceHeader: vi.fn(),
      createInvoiceLine: vi.fn()
    };
    inventoryRepo = {
      createTransaction: vi.fn()
    };
    journalRepo = {
      createEntry: vi.fn(),
      createLine: vi.fn()
    };
    service = new InvoiceService(invoiceRepo, inventoryRepo, journalRepo);
  });

  describe('createPurchaseInvoice', () => {
    it('should create purchase invoice, lines, inventory and journal entry', async () => {
      invoiceRepo.createInvoiceHeader.mockResolvedValue({ id: 5, invoiceNumber: 'PUR-123' });
      
      const result = await service.createPurchaseInvoice({
        partnerId: 1,
        invoiceNumber: 'PUR-123',
        totalAmount: "1000",
        notes: "Test",
        items: [
          { itemId: 10, quantity: 5, unitPrice: 200 }
        ]
      });

      expect(result.id).toBe(5);
      
      // Invoice
      expect(invoiceRepo.createInvoiceHeader).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'purchase', totalAmount: "1000" })
      );
      expect(invoiceRepo.createInvoiceLine).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ invoiceId: 5, itemId: 10, quantity: 5, totalPrice: 1000 })
      );
      
      // Inventory (Positive for Purchase)
      expect(inventoryRepo.createTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ itemId: 10, quantityChange: 5, referenceType: 'purchase_invoice' })
      );
      
      // Journal
      expect(journalRepo.createEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ referenceId: '5', referenceType: 'purchase_invoice' })
      );
    });
  });

  describe('createSaleInvoice', () => {
    it('should create sale invoice, lines, outward inventory and journal entry', async () => {
      invoiceRepo.createInvoiceHeader.mockResolvedValue({ id: 6, invoiceNumber: 'SAL-123' });
      
      const result = await service.createSaleInvoice({
        partnerId: 2,
        invoiceNumber: 'SAL-123',
        totalAmount: "2000",
        notes: "Sale Test",
        items: [
          { itemId: 20, quantity: 10, unitPrice: 200 }
        ]
      });

      expect(result.id).toBe(6);
      
      expect(invoiceRepo.createInvoiceHeader).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ type: 'sale' })
      );
      
      // Inventory (Negative for Sale)
      expect(inventoryRepo.createTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ itemId: 20, quantityChange: -10, referenceType: 'sale_invoice' })
      );
    });
  });
});
