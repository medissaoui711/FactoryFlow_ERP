import { ICheckRepository, IJournalRepository } from "../domain/interfaces.ts";
import { db } from "../../db/db.ts";

export class CheckService {
  constructor(
    private checkRepo: ICheckRepository,
    private journalRepo: IJournalRepository
  ) {}

  async getChecks(type?: string, status?: string) {
    return await this.checkRepo.getChecks(type, status);
  }

  async createCheck(data: any) {
    const { checkNumber, bankName, amount, dueDate, status, partnerId, type } = data;
    
    return await db.transaction(async (tx) => {
      return await this.checkRepo.createCheck(tx, {
        checkNumber,
        bankName,
        amount: amount.toString(),
        dueDate: new Date(dueDate),
        status: status || 'in_drawer',
        partnerId: partnerId ? parseInt(partnerId) : null,
        type // 'payable' or 'receivable'
      });
    });
  }

  async updateStatus(id: number, status: string) {
    return await db.transaction(async (tx) => {
      // In a real system, changing status might also create journal entries
      // e.g. from 'in_drawer' to 'under_collection' or 'collected'
      return await this.checkRepo.updateStatus(tx, id, status);
    });
  }
}
