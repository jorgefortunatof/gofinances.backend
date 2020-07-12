import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find();

    const income = allTransactions.reduce(
      (acc, item) => (item.type === 'income' ? acc + item.value : acc),
      0,
    );
    const outcome = allTransactions.reduce(
      (acc, item) => (item.type === 'outcome' ? acc + item.value : acc),
      0,
    );

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
