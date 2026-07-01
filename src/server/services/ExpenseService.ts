import { IExpenseRepository, IJournalRepository } from "../domain/interfaces.ts";
import { db } from "../../db/db.ts";

export class ExpenseService {
  constructor(
    private expenseRepo: IExpenseRepository,
    private journalRepo: IJournalRepository
  ) {}

  async getExpenses() {
    return await this.expenseRepo.getExpenses();
  }

  async createExpense(data: any) {
    const { accountId, amount, description, treasuryId } = data;
    
    return await db.transaction(async (tx) => {
      // Create the expense record
      const expense = await this.expenseRepo.createExpense(tx, {
        accountId: parseInt(accountId),
        amount: amount.toString(),
        description,
        date: new Date()
      });

      // If treasuryId is provided, pay it from treasury
      if (treasuryId) {
        const jEntry = await this.journalRepo.createEntry(tx, {
          referenceType: 'expense',
          description: description || 'تسجيل مصروف',
          date: new Date()
        });

        // Treasury Out (Credit)
        await this.journalRepo.createLine(tx, {
          journalEntryId: jEntry.id,
          accountId: parseInt(treasuryId),
          debit: "0",
          credit: amount.toString()
        });

        // Expense In (Debit)
        await this.journalRepo.createLine(tx, {
          journalEntryId: jEntry.id,
          accountId: parseInt(accountId),
          debit: amount.toString(),
          credit: "0"
        });
      }

      return expense;
    });
  }
}
