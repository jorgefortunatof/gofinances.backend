// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    value,
    type,
    category,
    title,
  }: Request): Promise<Transaction> {
    const transactionsRepository = new TransactionsRepository();

    // VERIFICAR SE CATEGORY EXISTE
    // CRIAR OU USAR CATEGORIA EXISTENTE
  }
}

export default CreateTransactionService;
