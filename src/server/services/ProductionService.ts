import { IProductionOrderRepository, IInventoryRepository, IJournalRepository } from "../domain/interfaces.ts";
import { db } from "../../db/db.ts";

export class ProductionService {
  constructor(
    private productionRepo: IProductionOrderRepository,
    private inventoryRepo: IInventoryRepository,
    private journalRepo: IJournalRepository
  ) {}

  async getOrders() {
    return await this.productionRepo.getOrders();
  }

  async createOrder(data: any) {
    const { orderNumber, itemId, targetQuantity, startDate, endDate, notes } = data;
    
    return await db.transaction(async (tx) => {
      return await this.productionRepo.createOrder(tx, {
        orderNumber: orderNumber || `PRD-${Date.now()}`,
        itemId: parseInt(itemId),
        targetQuantity: targetQuantity.toString(),
        producedQuantity: "0",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'planned',
        notes
      });
    });
  }

  async createCuttingOrder(data: any) {
    const { inputItems, outputItems, totalInputWeight } = data;
    
    return await db.transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await this.productionRepo.createOrder(tx, {
        orderNumber: `CO-${Date.now()}`,
        status: 'completed', // auto complete for now
        type: 'cutting',
        totalInputWeight,
        completedAt: new Date()
      });

      const orderId = newOrder.id;

      // 2. Deduct Raw Material
      for (const item of inputItems) {
        await this.inventoryRepo.createTransaction(tx, {
          itemId: item.itemId,
          quantityChange: -item.weight,
          unit: 'tons',
          referenceId: orderId.toString(),
          referenceType: 'production_order_input',
          notes: 'Cutting Order Input'
        });
      }

      // 3. Add Strip Rolls (Outputs)
      for (const item of outputItems) {
        const itemId = await this.productionRepo.findOrCreateItem(tx, {
          code: item.code,
          name: `شريحة ${item.size}مم`,
          type: 'strip_roll',
          thickness: item.thickness,
          size: item.size
        });

        await this.inventoryRepo.createTransaction(tx, {
          itemId: itemId,
          quantityChange: item.weight,
          unit: 'tons',
          referenceId: orderId.toString(),
          referenceType: 'production_order_output',
          notes: 'Cutting Order Output'
        });
      }

      // 4. Create Journal Entry (Work In Progress -> Inventory)
      await this.journalRepo.createEntry(tx, {
        referenceId: orderId.toString(),
        referenceType: 'production_order',
        description: `Cutting Order ${newOrder.orderNumber}`,
        date: new Date()
      });

      return newOrder;
    });
  }

  async updateStatus(id: number, status: string, items?: any[]) {
    return await db.transaction(async (tx) => {
      const updated = await this.productionRepo.updateStatus(tx, id, status);
      
      if (status === 'completed' && items && items.length > 0) {
        // e.g. increase inventory for the produced item, decrease for raw materials
        // we'll just handle the produced item for now to match old logic
        for (const item of items) {
          if (item.type === 'produced') {
            await this.inventoryRepo.createTransaction(tx, {
              itemId: item.itemId,
              quantityChange: parseFloat(item.quantity),
              unit: 'tons',
              referenceId: id.toString(),
              referenceType: 'production_order',
              notes: `Production Output for Order ${updated.orderNumber}`
            });
          }
          // raw materials would have negative quantityChange
        }
      }

      return updated;
    });
  }
}
