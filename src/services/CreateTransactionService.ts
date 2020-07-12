import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

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
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type must be income or outcome');
    }

    const { outcome, income } = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      if (outcome + value > income) {
        throw new AppError(
          'The total outcome can´t be bigger than the total income.',
        );
      }
    }

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    let category_id;

    if (!categoryExists) {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      category_id = newCategory.id;
    } else {
      category_id = categoryExists.id;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
