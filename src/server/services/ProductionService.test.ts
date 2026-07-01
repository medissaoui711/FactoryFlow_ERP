import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductionService } from './ProductionService';

// Mock the database transaction
vi.mock('../../db/db.ts', () => ({
  db: {
    transaction: vi.fn().mockImplementation(async (callback) => {
      // Pass a dummy 'tx' object
      return await callback({});
    })
  }
}));

describe('ProductionService', () => {
  let productionRepo: any;
  let inventoryRepo: any;
  let journalRepo: any;
  let service: ProductionService;

  beforeEach(() => {
    // Reset mocks before each test
    productionRepo = {
      getOrders: vi.fn(),
      createOrder: vi.fn(),
      updateStatus: vi.fn(),
      findOrCreateItem: vi.fn()
    };

    inventoryRepo = {
      createTransaction: vi.fn()
    };

    journalRepo = {
      createEntry: vi.fn(),
      createLine: vi.fn()
    };

    service = new ProductionService(productionRepo, inventoryRepo, journalRepo);
  });

  describe('createCuttingOrder', () => {
    it('should create a cutting order and process inventory changes successfully', async () => {
      // Arrange
      const mockOrder = {
        id: 1,
        orderNumber: 'CO-123',
        status: 'completed',
      };
      
      productionRepo.createOrder.mockResolvedValue(mockOrder);
      productionRepo.findOrCreateItem.mockResolvedValue(99); // Dummy itemId for strip roll

      const testData = {
        totalInputWeight: 100,
        inputItems: [
          { itemId: 10, weight: 100 }
        ],
        outputItems: [
          { code: 'STRIP-01', size: 5, thickness: 2, weight: 90 },
          { code: 'STRIP-02', size: 3, thickness: 2, weight: 10 }
        ]
      };

      // Act
      const result = await service.createCuttingOrder(testData);

      // Assert
      expect(result).toEqual(mockOrder);
      
      // 1. Verify Order Creation
      expect(productionRepo.createOrder).toHaveBeenCalledTimes(1);
      const createOrderArgs = productionRepo.createOrder.mock.calls[0][1];
      expect(createOrderArgs.type).toBe('cutting');
      expect(createOrderArgs.totalInputWeight).toBe(100);

      // 2. Verify Input Deductions (Raw Material)
      expect(inventoryRepo.createTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          itemId: 10,
          quantityChange: -100,
          referenceType: 'production_order_input'
        })
      );

      // 3. Verify Outputs Additions (Strip Rolls)
      expect(productionRepo.findOrCreateItem).toHaveBeenCalledTimes(2);
      expect(productionRepo.findOrCreateItem).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ code: 'STRIP-01' })
      );

      expect(inventoryRepo.createTransaction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          itemId: 99,
          quantityChange: 90,
          referenceType: 'production_order_output'
        })
      );
      
      // 4. Verify Journal Entry
      expect(journalRepo.createEntry).toHaveBeenCalledTimes(1);
      expect(journalRepo.createEntry).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          referenceId: '1',
          referenceType: 'production_order',
          description: 'Cutting Order CO-123'
        })
      );
    });
  });
});
