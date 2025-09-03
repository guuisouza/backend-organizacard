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

export const createdFirstInstallment = {
  ...createTransactionWithInstallmentDto,
  id: '28669cda-3904-4675-9ba7-80feefa4cca5',
  installment_number: 1,
  parent_transaction_id: null,
  is_installment: true,
};

export const otherInstallments = [
  {
    ...createTransactionWithInstallmentDto,
    id: '786dba35-046e-4151-988b-41968b1c4c32',
    amount_in_cents: 5000,
    description: 'Cinema - parcela 2/3',
    installment_number: 2,
    parent_transaction_id: '28669cda-3904-4675-9ba7-80feefa4cca5',
    is_installment: true,
  },
  {
    ...createTransactionWithInstallmentDto,
    id: 'dba287c6-eada-402b-bdd3-a940fe451b08',
    amount_in_cents: 5000,
    description: 'Cinema - parcela 3/3',
    installment_number: 3,
    parent_transaction_id: '28669cda-3904-4675-9ba7-80feefa4cca5',
    is_installment: true,
  },
];
