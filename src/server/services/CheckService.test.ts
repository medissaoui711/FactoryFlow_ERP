import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CheckService } from './CheckService';

vi.mock('../../db/db.ts', () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (callback) => {
      return await callback({});
    })
  }
}));

describe('CheckService', () => {
  let checkRepo: any;
  let journalRepo: any;
  let service: CheckService;

  beforeEach(() => {
    checkRepo = {
      getChecks: vi.fn(),
      createCheck: vi.fn(),
      updateStatus: vi.fn()
    };
    journalRepo = {
      createEntry: vi.fn(),
      createLine: vi.fn()
    };
    service = new CheckService(checkRepo, journalRepo);
  });

  describe('createCheck', () => {
    it('should create a check correctly', async () => {
      checkRepo.createCheck.mockResolvedValue({ id: 10, checkNumber: "CHK-1" });
      
      const result = await service.createCheck({ 
        checkNumber: "CHK-1", 
        bankName: "Ahli", 
        amount: "1500", 
        dueDate: "2024-01-01", 
        status: "in_drawer", 
        partnerId: "3", 
        type: "payable" 
      });
      
      expect(result.id).toBe(10);
      expect(checkRepo.createCheck).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          checkNumber: "CHK-1",
          amount: "1500",
          partnerId: 3,
          type: "payable"
        })
      );
    });
  });

  describe('updateStatus', () => {
    it('should update check status', async () => {
      checkRepo.updateStatus.mockResolvedValue({ id: 10, status: "collected" });
      
      const result = await service.updateStatus(10, "collected");
      expect(result.status).toBe("collected");
      expect(checkRepo.updateStatus).toHaveBeenCalledWith(expect.anything(), 10, "collected");
    });
  });
});
