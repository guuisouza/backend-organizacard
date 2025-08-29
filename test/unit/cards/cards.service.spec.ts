import { Repository } from 'typeorm';
import { CardService } from '../../../src/modules/card/card.service';
import { Card } from '../../../src/entities/card.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createTypeormRepositoryMock } from '../../utils/typeorm-repository.mock';
import {
  createCreditCardDto,
  createdCreditCard,
  createdCreditCardResponse,
  createdDebitCard,
  createdDebitCardResponse,
  createDebitCardDto,
} from '../../utils/card.mock';
import { createdUser } from '../../utils/user.mock';
import { BadRequestException } from '@nestjs/common';

describe('CardsService', () => {
  let cardService: CardService;
  let cardsRepository: jest.Mocked<Repository<Card>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: createTypeormRepositoryMock(),
        },
      ],
    }).compile();

    cardService = module.get<CardService>(CardService);
    cardsRepository = module.get(getRepositoryToken(Card));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of CardService and CardsRepository', () => {
    expect(cardService).toBeDefined();
    expect(cardsRepository).toBeDefined();
  });

  describe('CreateCard', () => {
    it('should throw BadRequestException if user has already created 5 cards', async () => {
      cardsRepository.count.mockResolvedValue(5);

      await expect(
        cardService.createCard(createDebitCardDto, createdUser.id),
      ).rejects.toThrow(
        new BadRequestException("You can't create more than 5 cards"),
      );
      expect(cardsRepository.count).toHaveBeenCalledWith({
        where: { user: { id: createdUser.id } },
      });
      expect(cardsRepository.create).not.toHaveBeenCalled();
      expect(cardsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if due day is equal to closing day', async () => {
      const creditCardDto = {
        ...createCreditCardDto,
        invoice_due_day: 10,
        invoice_closing_day: 10,
      };
      cardsRepository.count.mockResolvedValue(4);
      await expect(
        cardService.createCard(creditCardDto, createdUser.id),
      ).rejects.toThrow(
        new BadRequestException(
          'Invoice due day and invoice closing day must be different',
        ),
      );

      expect(cardsRepository.count).toHaveBeenCalledWith({
        where: { user: { id: createdUser.id } },
      });
      expect(cardsRepository.create).not.toHaveBeenCalled();
      expect(cardsRepository.save).not.toHaveBeenCalled();
    });

    it('should create a new debit card successfully', async () => {
      cardsRepository.count.mockResolvedValue(4);
      cardsRepository.create.mockReturnValue(createdDebitCard);
      cardsRepository.save.mockResolvedValue(createdDebitCard);

      const result = await cardService.createCard(
        createDebitCardDto,
        createdUser.id,
      );

      expect(result).toEqual(createdDebitCardResponse);
      expect(cardsRepository.count).toHaveBeenCalledWith({
        where: { user: { id: createdUser.id } },
      });
      expect(cardsRepository.create).toHaveBeenCalledWith({
        ...createDebitCardDto,
        user: { id: createdUser.id },
      });
      expect(cardsRepository.save).toHaveBeenCalledWith(createdDebitCard);
    });

    it('should create a new credit card successfully', async () => {
      cardsRepository.count.mockResolvedValue(4);
      cardsRepository.create.mockReturnValue(createdCreditCard);
      cardsRepository.save.mockResolvedValue(createdCreditCard);

      const result = await cardService.createCard(
        createCreditCardDto,
        createdUser.id,
      );

      expect(result).toEqual(createdCreditCardResponse);
      expect(cardsRepository.count).toHaveBeenCalledWith({
        where: { user: { id: createdUser.id } },
      });
      expect(cardsRepository.create).toHaveBeenCalledWith({
        ...createCreditCardDto,
        user: { id: createdUser.id },
      });
      expect(cardsRepository.save).toHaveBeenCalledWith(createdCreditCard);
      expect(cardsRepository.save).toHaveBeenCalledWith(createdCreditCard);
    });
  });
});
