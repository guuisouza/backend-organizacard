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
  getCreditCardResponse,
  getDebitCardResponse,
} from '../../utils/card.mock';
import { createdUser } from '../../utils/user.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PatchCardDto } from '../../../src/modules/card/dto/update-card.dto';

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

      expect(result).toEqual({
        ...createdDebitCardResponse,
        created_at: expect.any(Date),
      });
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

      expect(result).toEqual({
        ...createdCreditCardResponse,
        created_at: expect.any(Date),
      });
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

  describe('GetCards', () => {
    it("should return an empty array if user doesn't have any cards", async () => {
      cardsRepository.findBy.mockResolvedValue([]);
      const result = await cardService.getCards(createdUser.id);
      expect(result).toEqual([]);
    });

    it('should return an array of cards', async () => {
      cardsRepository.findBy.mockResolvedValue([
        createdCreditCard,
        createdDebitCard,
      ]);
      const result = await cardService.getCards(createdUser.id);
      expect(result).toEqual([getCreditCardResponse, getDebitCardResponse]);
      expect(cardsRepository.findBy).toHaveBeenCalledWith({
        user: { id: createdUser.id },
      });
    });
  });

  describe('FindCardByIdOrThrow', () => {
    it('should throw NotFoundException if card is not found', async () => {
      cardsRepository.findOneBy.mockResolvedValue(null);
      await expect(
        cardService.findCardByIdOrThrow(createdDebitCard.id),
      ).rejects.toThrow(new NotFoundException('Card not found'));
      expect(cardsRepository.findOneBy).toHaveBeenCalledWith({
        id: createdDebitCard.id,
      });
    });

    it('should return a card', async () => {
      cardsRepository.findOneBy.mockResolvedValue(createdDebitCard);
      const result = await cardService.findCardByIdOrThrow(createdDebitCard.id);
      expect(result).toEqual(createdDebitCard);
      expect(cardsRepository.findOneBy).toHaveBeenCalledWith({
        id: createdDebitCard.id,
      });
    });
  });

  describe('PatchCardById', () => {
    it('should throw NotFoundException if card is not found', async () => {
      const inexistentCardId = 'inexistent-card-id';
      cardsRepository.findOneBy.mockResolvedValue(null);
      await expect(
        cardService.patchCardById(inexistentCardId, createdUser.id, {}),
      ).rejects.toThrow(new NotFoundException('Card not found'));
      expect(cardsRepository.findOneBy).toHaveBeenCalledWith({
        id: inexistentCardId,
        user: { id: createdUser.id },
      });
      expect(cardsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if trying to change forbidden fields', async () => {
      cardsRepository.findOneBy.mockResolvedValue(createdCreditCard);

      await expect(
        cardService.patchCardById(
          createdCreditCard.id,
          createdCreditCard.user.id,
          {
            invoice_closing_day: 10, // campo proibido
          } as PatchCardDto,
        ),
      ).rejects.toThrow(
        new BadRequestException('You cannot change these fields'),
      );

      expect(cardsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no valid fields are provided', async () => {
      cardsRepository.findOneBy.mockResolvedValue(createdCreditCard);

      await expect(
        cardService.patchCardById(
          createdCreditCard.id,
          createdCreditCard.user.id,
          {},
        ),
      ).rejects.toThrow(
        new BadRequestException('No valid fields provided for update.'),
      );

      expect(cardsRepository.update).not.toHaveBeenCalled();
    });

    it('should update debit card without credit_limit_in_cents', async () => {
      cardsRepository.findOneBy.mockResolvedValue(createdDebitCard);

      await cardService.patchCardById(
        createdDebitCard.id,
        createdDebitCard.user.id,
        {
          name: 'Updated Debit Card',
          credit_limit_in_cents: 5000,
        },
      );

      expect(cardsRepository.update).toHaveBeenCalledWith(
        { id: createdDebitCard.id },
        { name: 'Updated Debit Card' },
      );
    });

    it('should update credit card with valid fields', async () => {
      cardsRepository.findOneBy.mockResolvedValue(createdCreditCard);

      await cardService.patchCardById(
        createdCreditCard.id,
        createdCreditCard.user.id,
        {
          name: 'Updated Credit Card',
          credit_limit_in_cents: 20000,
        },
      );

      expect(cardsRepository.update).toHaveBeenCalledWith(
        { id: createdCreditCard.id },
        { name: 'Updated Credit Card', credit_limit_in_cents: 20000 },
      );
    });
  });

  describe('DeleteCardById', () => {
    it('should throw NotFoundException if card is not found', async () => {
      const inexistentCardId = 'inexistent-card-id';
      cardsRepository.findOneBy.mockResolvedValue(null);
      await expect(
        cardService.deleteCardById(inexistentCardId, createdUser.id),
      ).rejects.toThrow(new NotFoundException('Card not found'));
      expect(cardsRepository.findOneBy).toHaveBeenCalledWith({
        id: inexistentCardId,
        user: { id: createdUser.id },
      });
      expect(cardsRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete a card', async () => {
      cardsRepository.findOneBy.mockResolvedValue(createdDebitCard);
      await cardService.deleteCardById(createdDebitCard.id, createdUser.id);
      expect(cardsRepository.findOneBy).toHaveBeenCalledWith({
        id: createdDebitCard.id,
        user: { id: createdUser.id },
      });
      expect(cardsRepository.delete).toHaveBeenCalledWith({
        id: createdDebitCard.id,
      });
    });
  });
});
