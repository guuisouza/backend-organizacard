import { TransactionCategoryType } from '../../src/shared/enums/transaction-category.enum';

export const createTransactionWithoutInstallmentDto = {
  category: TransactionCategoryType.FOOD,
  description: 'Comida no restaurante Pizza Hut',
  amount_in_cents: 15000,
  transaction_date: new Date(),
  is_installment: false,
};

export const createTransactionWithInstallmentDto = {
  category: TransactionCategoryType.ENTERTAINMENT,
  description: 'Cinema',
  amount_in_cents: 15000,
  transaction_date: new Date(),
  is_installment: true,
  total_installments: 3,
};
