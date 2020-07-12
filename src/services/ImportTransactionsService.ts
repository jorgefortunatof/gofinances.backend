import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface TransactionCSV {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);
    const fileStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCsv = fileStream.pipe(parsers);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCsv.on('end', resolve));

    const existentsCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const existentsCategoriesTitles = existentsCategories.map(
      (category: Category) => category.title,
    );

    const addCategories = categories
      .filter(title => !existentsCategoriesTitles.includes(title))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategories.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [...newCategories, ...existentsCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category_id: allCategories.find(
          category => category.title === transaction.category,
        )?.id,
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
