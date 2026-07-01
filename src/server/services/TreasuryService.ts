import { ITreasuryRepository, IJournalRepository } from "../domain/interfaces.ts";
import { db } from "../../db/db.ts";

export class TreasuryService {
  constructor(
    private treasuryRepo: ITreasuryRepository,
    private journalRepo: IJournalRepository
  ) {}

  async getBalances() {
    return await this.treasuryRepo.getBalances();
  }

  async getTransactions() {
    return await this.treasuryRepo.getTransactions();
  }

  async createTransaction(data: any) {
    const { accountId, type, amount, description } = data;
    
    return await db.transaction(async (tx) => {
      const jEntry = await this.journalRepo.createEntry(tx, {
        referenceType: 'treasury',
        description: description || (type === 'in' ? 'إيداع/استلام نقدية' : 'صرف نقدية'),
        date: new Date()
      });

      if (type === 'in') {
        await this.journalRepo.createLine(tx, {
          journalEntryId: jEntry.id,
          accountId: parseInt(accountId),
          debit: amount.toString(),
          credit: "0"
        });
        
        // We'd ideally credit a source account, using dummy for now or skipped
      } else {
        await this.journalRepo.createLine(tx, {
          journalEntryId: jEntry.id,
          accountId: parseInt(accountId),
          debit: "0",
          credit: amount.toString()
        });
        
        // We'd ideally debit a dest account
      }

      return jEntry;
    });
  }
}
