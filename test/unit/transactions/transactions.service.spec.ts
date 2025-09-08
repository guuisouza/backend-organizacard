import { Between, QueryBuilder, Repository } from 'typeorm';
import { TransactionService } from '../../../src/modules/transaction/transaction.service';
import { CardService } from '../../../src/modules/card/card.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTypeormRepositoryMock } from '../../utils/typeorm-repository.mock';
import { cardServiceMock } from '../../utils/card-service.mock';
import { Transaction } from '../../../src/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';
import {
  createdFirstInstallment,
  createTransactionWithInstallmentDto,
  createTransactionWithoutInstallmentDto,
  getCreditTransactionsByInvoice,
  getDebitTransactionsByInvoice,
  getTransaction,
  otherInstallments,
} from '../../utils/transaction.mock';
import { createdCreditCard, createdDebitCard } from '../../utils/card.mock';
import { Card } from '../../../src/entities/card.entity';

describe('TransactionsService', () => {
  let transactionsService: TransactionService;
  let transactionsRepository: jest.Mocked<Repository<Transaction>>;
  let cardService: jest.Mocked<CardService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: createTypeormRepositoryMock(),
        },
        cardServiceMock,
      ],
    }).compile();

    transactionsService = module.get<TransactionService>(TransactionService);
    transactionsRepository = module.get(getRepositoryToken(Transaction));
    cardService = module.get(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of TransactionService, TransactionsRepository and CardService', () => {
    expect(transactionsService).toBeDefined();
    expect(transactionsRepository).toBeDefined();
    expect(cardService).toBeDefined();
  });

  describe('Create Transaction', () => {
    it("should throw an not found exception if the card doesn't exist", async () => {
      cardService.findCardByIdOrThrow.mockRejectedValue(
        new NotFoundException('Card not found'),
      );

      await expect(
        transactionsService.createTransaction(
          createTransactionWithInstallmentDto,
          'cardId',
        ),
      ).rejects.toThrow(new NotFoundException('Card not found'));

      expect(cardService.findCardByIdOrThrow).toHaveBeenCalledWith('cardId');
      expect(transactionsRepository.create).not.toHaveBeenCalled();
      expect(transactionsRepository.save).not.toHaveBeenCalled();
    });

    it('should create a debit card transaction successfully', async () => {
      cardService.findCardByIdOrThrow.mockResolvedValue(
        createdDebitCard as Card,
      );

      transactionsRepository.create.mockImplementation(
        (data) => ({ id: 'transactionId', ...data }) as Transaction,
      );
      transactionsRepository.save.mockResolvedValue({
        id: 'transactionId',
      } as Transaction);

      const result = await transactionsService.createTransaction(
        createTransactionWithoutInstallmentDto,
        createdDebitCard.id,
      );

      expect(cardService.findCardByIdOrThrow).toHaveBeenCalledWith(
        createdDebitCard.id,
      );
      expect(result).toEqual({ transaction_id: 'transactionId' });
      expect(transactionsRepository.create).toHaveBeenCalledWith({
        ...createTransactionWithoutInstallmentDto,
        card: { id: createdDebitCard.id },
        transaction_date: new Date(
          createTransactionWithoutInstallmentDto.transaction_date,
        ),
        total_installments: null,
      });
      expect(transactionsRepository.save).toHaveBeenCalledWith({
        id: 'transactionId',
        ...createTransactionWithoutInstallmentDto,
        card: { id: createdDebitCard.id },
        transaction_date: new Date(
          createTransactionWithoutInstallmentDto.transaction_date,
        ),
        total_installments: null,
      });
    });

    it('should create a credit card transaction with installments successfully', async () => {
      const firstInstallmentId = createdFirstInstallment.id;

      cardService.findCardByIdOrThrow.mockResolvedValue(
        createdCreditCard as Card,
      );

      transactionsRepository.create
        .mockImplementationOnce(
          (data) => ({ id: firstInstallmentId, ...data }) as Transaction,
        ) // first installment
        .mockImplementationOnce(
          (data) =>
            ({
              id: otherInstallments[0].id,
              ...data,
            }) as Transaction,
        ) // 2nd
        .mockImplementationOnce(
          (data) =>
            ({
              id: otherInstallments[1].id,
              ...data,
            }) as Transaction,
        ); // 3rd

      transactionsRepository.save
        .mockResolvedValueOnce(
          createdFirstInstallment as unknown as Transaction,
        ) // save first
        .mockResolvedValueOnce(otherInstallments as unknown as Transaction); // save others

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(transactionsService as any, 'getNextInvoiceDate')
        .mockImplementationOnce(() => new Date('2025-10-01'))
        .mockImplementationOnce(() => new Date('2025-11-01'));

      const result = await transactionsService.createTransaction(
        createTransactionWithInstallmentDto,
        createdCreditCard.id,
      );

      expect(cardService.findCardByIdOrThrow).toHaveBeenCalledWith(
        createdCreditCard.id,
      );

      //First Installment
      expect(transactionsRepository.create).toHaveBeenCalledWith({
        ...createTransactionWithInstallmentDto,
        card: { id: createdCreditCard.id },
        amount_in_cents: Math.floor(
          createTransactionWithInstallmentDto.amount_in_cents /
            createTransactionWithInstallmentDto.total_installments!,
        ),
        transaction_date: new Date(
          createTransactionWithInstallmentDto.transaction_date,
        ),
        is_installment: true,
        installment_number: 1,
      });

      expect(transactionsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: firstInstallmentId,
        }),
      );

      // Others Installments
      expect(transactionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Cinema - parcela 2/3',
          installment_number: 2,
          parent_transaction_id: firstInstallmentId,
        }),
      );
      expect(transactionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Cinema - parcela 3/3',
          installment_number: 3,
          parent_transaction_id: firstInstallmentId,
        }),
      );

      expect(transactionsRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: otherInstallments[0].id }),
          expect.objectContaining({ id: otherInstallments[1].id }),
        ]),
      );

      expect(result).toEqual({
        parent_transaction_id: firstInstallmentId,
        installments: [
          {
            installment_number: 1,
            transaction_id: firstInstallmentId,
            amount_in_cents: createdFirstInstallment.amount_in_cents,
            date: createdFirstInstallment.transaction_date,
          },
          {
            installment_number: 2,
            transaction_id: otherInstallments[0].id,
            amount_in_cents: otherInstallments[0].amount_in_cents,
            date: new Date('2025-10-01'),
          },
          {
            installment_number: 3,
            transaction_id: otherInstallments[1].id,
            amount_in_cents: otherInstallments[1].amount_in_cents,
            date: new Date('2025-11-01'),
          },
        ],
      });
    });
  });

  describe('Get Transaction by Id', () => {
    const cardId = createdDebitCard.id;
    it('should return a single transaction by id', async () => {
      transactionsRepository.findOneBy.mockResolvedValue(getTransaction);

      await expect(
        transactionsService.getTransactionById(
          cardId,
          '28669cda-3904-4675-9ba7-80feefa4cca5',
        ),
      ).resolves.toEqual(getTransaction);

      expect(transactionsRepository.findOneBy).toHaveBeenCalledWith(
        expect.objectContaining({
          card: { id: createdDebitCard.id },
          id: '28669cda-3904-4675-9ba7-80feefa4cca5',
        }),
      );
    });

    it("should throw not found exception if transaction doesn't exist", async () => {
      transactionsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        transactionsService.getTransactionById(
          cardId,
          'non-existent-transaction-id',
        ),
      ).rejects.toThrow(new NotFoundException('Transaction id not found'));

      expect(transactionsRepository.findOneBy).toHaveBeenCalledWith(
        expect.objectContaining({
          card: { id: cardId },
          id: 'non-existent-transaction-id',
        }),
      );
    });
  });

  describe('Delete transactions', () => {
    const cardId = createdDebitCard.id;
    const creditCardId = createdCreditCard.id;
    it("should throw not found exception if transaction doesn't exist", async () => {
      transactionsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        transactionsService.getTransactionById(
          cardId,
          'non-existent-transaction-id',
        ),
      ).rejects.toThrow(new NotFoundException('Transaction id not found'));

      expect(transactionsRepository.findOneBy).toHaveBeenCalledWith(
        expect.objectContaining({
          card: { id: cardId },
          id: 'non-existent-transaction-id',
        }),
      );
    });

    it("should delete only the transaction if it's not an installment or has a parent_transaction_id", async () => {
      transactionsRepository.findOneBy.mockResolvedValue(getTransaction);

      await expect(
        transactionsService.deleteTransactionById(
          createdDebitCard.id,
          '28669cda-3904-4675-9ba7-80feefa4cca5',
        ),
      ).resolves.toBeUndefined();

      expect(transactionsRepository.findOneBy).toHaveBeenCalledWith({
        card: { id: createdDebitCard.id },
        id: '28669cda-3904-4675-9ba7-80feefa4cca5',
      });
      expect(transactionsRepository.delete).toHaveBeenCalledWith({
        id: '28669cda-3904-4675-9ba7-80feefa4cca5',
      });
    });

    it('if the transaction is an installment, should delete first the main transaction and then the child installments', async () => {
      const parentTransaction = createdFirstInstallment;
      transactionsRepository.findOneBy.mockResolvedValue(
        createdFirstInstallment as Transaction,
      );

      await expect(
        transactionsService.deleteTransactionById(
          creditCardId,
          parentTransaction.id,
        ),
      ).resolves.toBeUndefined();

      expect(transactionsRepository.findOneBy).toHaveBeenCalledWith({
        card: { id: creditCardId },
        id: parentTransaction.id,
      });

      const qb = transactionsRepository.createQueryBuilder(
        'transactions',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as jest.Mocked<any>;
      expect(transactionsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(qb.delete).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith(
        'parent_transaction_id = :transactionId',
        { transactionId: parentTransaction.id },
      );
      expect(qb.execute).toHaveBeenCalled();

      expect(transactionsRepository.delete).toHaveBeenCalledWith({
        id: parentTransaction.id,
      });
    });
  });

  describe("Get user's transactions by current invoice/month", () => {
    function mockCurrentDate(date: string) {
      const mockDate = new Date(date);
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    }

    it("should throw not found exception if card doesn't exist", async () => {
      cardService.findCardByIdOrThrow.mockRejectedValue(
        new NotFoundException('Card not found'),
      );

      await expect(
        transactionsService.getCardTransactionsByCurrentInvoice(
          'non-existent-card-id',
        ),
      ).rejects.toThrow(new NotFoundException('Card not found'));

      expect(cardService.findCardByIdOrThrow).toHaveBeenCalledWith(
        'non-existent-card-id',
      );
      expect(transactionsRepository.find).not.toHaveBeenCalled();
    });

    describe('Debit card scenarios', () => {
      it('should return empty transactions for debit card when no transactions found', async () => {
        mockCurrentDate('2023-06-15');

        cardService.findCardByIdOrThrow.mockResolvedValue(createdDebitCard);
        transactionsRepository.find.mockResolvedValue([]);

        const response =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            createdDebitCard.id,
          );

        const expectedStartDate = new Date('2023-06-01');
        const expectedEndDate = new Date('2023-06-30');

        expect(transactionsRepository.find).toHaveBeenCalledWith({
          where: {
            card: { id: createdDebitCard.id },
            transaction_date: Between(expectedStartDate, expectedEndDate),
          },
          order: { transaction_date: 'DESC' },
        });

        expect(response).toEqual({
          start_date: expectedStartDate,
          end_date: expectedEndDate,
          transactions: [],
          total_card_balance: 0,
        });
      });

      it('should return transactions for debit card with correct balance calculation', async () => {
        mockCurrentDate('2023-06-15');

        cardService.findCardByIdOrThrow.mockResolvedValue(createdDebitCard);
        transactionsRepository.find.mockResolvedValue(
          getDebitTransactionsByInvoice,
        );

        const response =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            createdDebitCard.id,
          );

        const expectedStartDate = new Date('2023-06-01');
        const expectedEndDate = new Date('2023-06-30');

        expect(response).toEqual({
          start_date: expectedStartDate,
          end_date: expectedEndDate,
          transactions: getDebitTransactionsByInvoice,
          total_card_balance: 30000,
        });
      });

      it('should handle February in leap year for debit card', async () => {
        mockCurrentDate('2024-02-15'); // Year is leap

        cardService.findCardByIdOrThrow.mockResolvedValue(createdDebitCard);
        transactionsRepository.find.mockResolvedValue([]);

        const response =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            createdDebitCard.id,
          );

        expect(response.start_date).toEqual(new Date('2024-02-01'));
        expect(response.end_date).toEqual(new Date('2024-02-29')); // 29 days in february in leap year
      });

      it('should handle February in non-leap year for debit card', async () => {
        mockCurrentDate('2023-02-15'); // Year is not leap

        cardService.findCardByIdOrThrow.mockResolvedValue(createdDebitCard);
        transactionsRepository.find.mockResolvedValue([]);

        const response =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            createdDebitCard.id,
          );

        expect(response.start_date).toEqual(new Date('2023-02-01'));
        expect(response.end_date).toEqual(new Date('2023-02-28')); // 28 days in february in non-leap year
      });
    });

    describe('Credit card scenarios', () => {
      it('should return empty transactions for credit card when no transactions found (before closing day)', async () => {
        // 10th of June (before the 15th of the month)
        mockCurrentDate('2023-06-10');

        const card = createdCreditCard as Card;
        cardService.findCardByIdOrThrow.mockResolvedValue(card);
        transactionsRepository.find.mockResolvedValue([]);

        const result =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            card.id,
          );

        const expectedStartDate = new Date('2023-05-16'); // 16th of May
        const expectedEndDate = new Date('2023-06-15'); // 15th of June

        expect(transactionsRepository.find).toHaveBeenCalledWith({
          where: {
            card: { id: card.id },
            transaction_date: Between(expectedStartDate, expectedEndDate),
          },
          order: { transaction_date: 'DESC' },
        });

        expect(result).toEqual({
          start_date: expectedStartDate,
          end_date: expectedEndDate,
          transactions: [],
          total_card_balance: 0,
        });
      });

      it('should return empty transactions for credit card when no transactions found (after closing day)', async () => {
        // 20th of June (after the 15th of the month)
        mockCurrentDate('2023-06-20');

        const card = createdCreditCard as Card;
        cardService.findCardByIdOrThrow.mockResolvedValue(card);
        transactionsRepository.find.mockResolvedValue([]);

        const result =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            card.id,
          );

        const expectedStartDate = new Date('2023-06-16'); // 16th of June
        const expectedEndDate = new Date('2023-07-15'); // 15th of July

        expect(transactionsRepository.find).toHaveBeenCalledWith({
          where: {
            card: { id: card.id },
            transaction_date: Between(expectedStartDate, expectedEndDate),
          },
          order: { transaction_date: 'DESC' },
        });

        expect(result).toEqual({
          start_date: expectedStartDate,
          end_date: expectedEndDate,
          transactions: [],
          total_card_balance: 0,
        });
      });

      it('should return transactions for credit card with correct balance calculation', async () => {
        mockCurrentDate('2023-06-20');

        const card = createdCreditCard as Card;
        cardService.findCardByIdOrThrow.mockResolvedValue(card);
        transactionsRepository.find.mockResolvedValue(
          getCreditTransactionsByInvoice,
        );

        const result =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            card.id,
          );

        const totalBalance = getCreditTransactionsByInvoice.reduce(
          (acc, tx) => acc + tx.amount_in_cents,
          0,
        );

        expect(result.total_card_balance).toBe(totalBalance);
      });

      it('should handle year transition for credit card (before closing day in January)', async () => {
        // 10th of January of 2023 (before the 15th of the month)
        mockCurrentDate('2023-01-10');

        const card = createdCreditCard as Card;
        cardService.findCardByIdOrThrow.mockResolvedValue(card);
        transactionsRepository.find.mockResolvedValue([]);

        const result =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            card.id,
          );

        // Should return transactions from 16th of December of 2022 to 15th of January of 2023
        const expectedStartDate = new Date('2022-12-16');
        const expectedEndDate = new Date('2023-01-15');

        expect(result.start_date).toEqual(expectedStartDate);
        expect(result.end_date).toEqual(expectedEndDate);
      });

      it('should handle year transition for credit card (after closing day in December)', async () => {
        // 20th of December of 2023 (after the 15th of the month)
        mockCurrentDate('2023-12-20');

        const card = createdCreditCard as Card;
        cardService.findCardByIdOrThrow.mockResolvedValue(card);
        transactionsRepository.find.mockResolvedValue([]);

        const result =
          await transactionsService.getCardTransactionsByCurrentInvoice(
            card.id,
          );

        // Should return transactions from 16th of December of 2023 to 15th of January of 2024
        const expectedStartDate = new Date('2023-12-16');
        const expectedEndDate = new Date('2024-01-15');

        expect(result.start_date).toEqual(expectedStartDate);
        expect(result.end_date).toEqual(expectedEndDate);
      });
    });
  });
});
