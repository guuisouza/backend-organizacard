import { Repository } from 'typeorm';
import { TransactionService } from '../../../src/modules/transaction/transaction.service';
import { CardService } from '../../../src/modules/card/card.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTypeormRepositoryMock } from '../../utils/typeorm-repository.mock';
import { cardServiceMock } from '../../utils/card-service.mock';
import { Transaction } from '../../../src/entities/transaction.entity';
import { NotFoundException } from '@nestjs/common';
import { createTransactionWithInstallmentDto } from '../../utils/transaction.mock';

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
    it("should throw an error if the card doesn't exist", async () => {
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
  });
});
