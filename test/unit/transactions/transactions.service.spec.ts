import { Repository } from 'typeorm';
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
});
