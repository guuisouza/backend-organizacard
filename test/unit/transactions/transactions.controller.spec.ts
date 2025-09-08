import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from '../../../src/modules/transaction/transaction.controller';
import { TransactionService } from '../../../src/modules/transaction/transaction.service';
import { TransactionServiceMock } from '../../utils/transaction-service.mock';
import { JwtAuthGuard } from '../../../src/modules/auth/guards/jwt-auth.guard';
import { jwtAuthGuardMock } from '../../utils/authguard.mocks';
import {
  createdDebitCard,
  createdDebitCardResponse,
} from '../../utils/card.mock';
import {
  createTransactionWithoutInstallmentDto,
  getCreditTransactionsByInvoice,
  getTransaction,
} from '../../utils/transaction.mock';
import { ParseUUIDPipe } from '@nestjs/common';

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let transactionService: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [TransactionServiceMock],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    transactionService = module.get(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of UserController and UserService', () => {
    expect(transactionController).toBeDefined();
    expect(transactionService).toBeDefined();
  });

  describe('Controller - Create transaction', () => {
    const cardId = createdDebitCard.id;
    it('should call transactionService.createTransaction with correct data and return the result', async () => {
      transactionService.createTransaction.mockResolvedValue({
        transaction_id: 'transactionId',
      });

      const result = await transactionController.createTransaction(
        cardId,
        createTransactionWithoutInstallmentDto,
      );

      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        createTransactionWithoutInstallmentDto,
        cardId,
      );

      expect(result).toEqual({ transaction_id: 'transactionId' });
    });
  });

  describe('Controller - Get transaction by id', () => {
    const cardId = createdDebitCard.id;
    const transactionId = 'transactionId';
    it('should call transactionService.getTransactionById with correct data and return the result', async () => {
      transactionService.getTransactionById.mockResolvedValue(getTransaction);

      const result = await transactionController.getTransactionById(
        cardId,
        transactionId,
      );

      expect(transactionService.getTransactionById).toHaveBeenCalledWith(
        cardId,
        transactionId,
      );

      expect(result).toEqual(getTransaction);
    });
  });

  describe('Controller - Delete transaction by id', () => {
    const cardId = createdDebitCard.id;
    const transactionId = 'transactionId';
    it('should call transactionService.deleteTransactionById with correct data and return the result', async () => {
      transactionService.deleteTransactionById.mockResolvedValue(void 0);

      const result = await transactionController.deleteTransactionById(
        cardId,
        transactionId,
      );

      expect(transactionService.deleteTransactionById).toHaveBeenCalledWith(
        cardId,
        transactionId,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('Controller - Get transactions by current invoice/month', () => {
    const cardId = createdDebitCard.id;
    const transactionsResponse = {
      start_date: new Date(),
      end_date: new Date(),
      transactions: getCreditTransactionsByInvoice,
      total_card_balance: 0,
    };
    it('should call transactionService.getCardTransactionsByCurrentInvoice with correct data and return the result', async () => {
      transactionService.getCardTransactionsByCurrentInvoice.mockResolvedValue(
        transactionsResponse,
      );

      const result =
        await transactionController.getCardTransactionsByCurrentInvoice(cardId);

      expect(
        transactionService.getCardTransactionsByCurrentInvoice,
      ).toHaveBeenCalledWith(cardId);

      expect(result).toEqual(transactionsResponse);
    });
  });

  describe('Validation - Invalid UUIDs in methods that use UUID', () => {
    const invalidUUID = 'not-a-valid-uuid';

    it('should throw an error for invalid UUID in all methods', async () => {
      const pipe = new ParseUUIDPipe({ version: '4' });

      await expect(() =>
        pipe.transform(invalidUUID, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow('Validation failed (uuid v 4 is expected)');
    });
  });
});
