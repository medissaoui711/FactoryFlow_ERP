import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpenseService } from './ExpenseService';

// Mock the database transaction
vi.mock('../../db/db.ts', () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (callback) => {
      // Pass a dummy 'tx' object
      return await callback({});
    })
  }
}));

describe('ExpenseService', () => {
  let expenseRepo: any;
  let journalRepo: any;
  let service: ExpenseService;

  beforeEach(() => {
    expenseRepo = {
      getExpenses: vi.fn(),
      createExpense: vi.fn()
    };
    journalRepo = {
      createEntry: vi.fn(),
      createLine: vi.fn()
    };
    service = new ExpenseService(expenseRepo, journalRepo);
  });

  describe('createExpense', () => {
    it('should create an expense without treasury journal if treasuryId is missing', async () => {
      expenseRepo.createExpense.mockResolvedValue({ id: 1, amount: "100" });
      const result = await service.createExpense({ accountId: "2", amount: "100", description: "Test" });
      
      expect(result).toEqual({ id: 1, amount: "100" });
      expect(expenseRepo.createExpense).toHaveBeenCalledTimes(1);
      expect(journalRepo.createEntry).not.toHaveBeenCalled();
    });

    it('should create an expense with treasury journal if treasuryId is provided', async () => {
      expenseRepo.createExpense.mockResolvedValue({ id: 1, amount: "100" });
      journalRepo.createEntry.mockResolvedValue({ id: 99 });
      
      const result = await service.createExpense({ 
        accountId: "2", 
        amount: "100", 
        description: "Test", 
        treasuryId: "5" 
      });
      
      expect(result).toEqual({ id: 1, amount: "100" });
      expect(journalRepo.createEntry).toHaveBeenCalledTimes(1);
      expect(journalRepo.createLine).toHaveBeenCalledTimes(2);
      
      // Treasury out
      expect(journalRepo.createLine).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ accountId: 5, credit: "100", debit: "0" })
      );
      // Expense in
      expect(journalRepo.createLine).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ accountId: 2, credit: "0", debit: "100" })
      );
    });
  });
});
