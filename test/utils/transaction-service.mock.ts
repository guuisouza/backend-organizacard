import { TransactionService } from '../../src/modules/transaction/transaction.service';

export const TransactionServiceMock = {
  provide: TransactionService,
  useValue: {
    createTransaction: jest.fn(),
    createSingleTransaction: jest.fn(),
    createInstallmentTransactions: jest.fn(),
    getCardTransactionsByCurrentInvoice: jest.fn(),
    getTransactionById: jest.fn(),
    deleteTransactionById: jest.fn(),
  },
};
