import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TreasuryService } from './TreasuryService';

vi.mock('../../db/db.ts', () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback({});
    })
  }
}));

describe('TreasuryService', () => {
  let treasuryRepo: any;
  let journalRepo: any;
  let service: TreasuryService;

  beforeEach(() => {
    treasuryRepo = {
      getBalances: vi.fn(),
      getTransactions: vi.fn()
    };
    journalRepo = {
      createEntry: vi.fn(),
      createLine: vi.fn()
    };
    service = new TreasuryService(treasuryRepo, journalRepo);
  });

  describe('createTransaction', () => {
    it('should handle cash in correctly', async () => {
      journalRepo.createEntry.mockResolvedValue({ id: 7 });
      
      const result = await service.createTransaction({ accountId: "1", type: "in", amount: "500", description: "Deposit" });
      
      expect(result.id).toBe(7);
      expect(journalRepo.createEntry).toHaveBeenCalled();
      expect(journalRepo.createLine).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ accountId: 1, debit: "500", credit: "0" })
      );
    });

    it('should handle cash out correctly', async () => {
      journalRepo.createEntry.mockResolvedValue({ id: 8 });
      
      const result = await service.createTransaction({ accountId: "2", type: "out", amount: "300", description: "Withdrawal" });
      
      expect(result.id).toBe(8);
      expect(journalRepo.createLine).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ accountId: 2, debit: "0", credit: "300" })
      );
    });
  });
});
