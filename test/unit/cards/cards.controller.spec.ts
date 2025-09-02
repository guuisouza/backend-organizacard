import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from '../../../src/modules/card/card.controller';
import { CardService } from '../../../src/modules/card/card.service';
import { cardServiceMock } from '../../utils/card-service.mock';
import { JwtAuthGuard } from '../../../src/modules/auth/guards/jwt-auth.guard';
import { jwtAuthGuardMock } from '../../utils/authguard.mocks';
import {
  createCreditCardDto,
  createdCreditCardResponse,
  getCreditCardResponse,
  getDebitCardResponse,
} from '../../utils/card.mock';
import { createdSafeUser } from '../../utils/user.mock';
import { ParseUUIDPipe } from '@nestjs/common';

describe('CardController', () => {
  let cardController: CardController;
  let cardService: jest.Mocked<CardService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [cardServiceMock],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile();

    cardController = module.get<CardController>(CardController);
    cardService = module.get(CardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of CardController and CardService', () => {
    expect(cardController).toBeDefined();
    expect(cardService).toBeDefined();
  });

  describe('Controller - Create card', () => {
    it('should call cardService.createCard with correct data and return the result', async () => {
      cardService.createCard.mockResolvedValue(createdCreditCardResponse);

      const result = await cardController.createCard(
        createdSafeUser.id,
        createCreditCardDto,
      );

      expect(cardService.createCard).toHaveBeenCalledWith(
        createCreditCardDto,
        createdSafeUser.id,
      );
      expect(result).toEqual(createdCreditCardResponse);
    });
  });

  describe("Controller - Summary user's cards", () => {
    it("should call cardService.getCards with correct data and return an empty array if user doesn't have any cards", async () => {
      cardService.getCards.mockResolvedValue([]);

      const result = await cardController.getCards(createdSafeUser.id);

      expect(cardService.getCards).toHaveBeenCalledWith(createdSafeUser.id);
      expect(result).toEqual([]);
    });

    it('should call cardService.getCards with correct data and return an array of cards', async () => {
      cardService.getCards.mockResolvedValue([
        getCreditCardResponse,
        getDebitCardResponse,
      ]);

      const result = await cardController.getCards(createdSafeUser.id);

      expect(cardService.getCards).toHaveBeenCalledWith(createdSafeUser.id);
      expect(result).toEqual([getCreditCardResponse, getDebitCardResponse]);
    });
  });

  describe('Controller - Update card', () => {
    it('should call cardService.updateCard with correct data and return the result', async () => {
      const dataToUpdate = {
        name: 'Credit Card Nubank',
        brand: 'Nubank',
        credit_limit_in_cents: 2502000,
      };

      cardService.patchCardById.mockResolvedValue(void 0);

      const result = await cardController.updateCard(
        getCreditCardResponse.id,
        createdSafeUser.id,
        dataToUpdate,
      );

      expect(cardService.patchCardById).toHaveBeenCalledWith(
        getCreditCardResponse.id,
        createdSafeUser.id,
        dataToUpdate,
      );

      expect(result).toEqual(void 0);
    });
  });

  describe('Controller - Delete card', () => {
    it('should call cardService.deleteCard with correct data and return the result', async () => {
      cardService.deleteCardById.mockResolvedValue(void 0);

      const result = await cardController.deleteCard(
        getCreditCardResponse.id,
        createdSafeUser.id,
      );

      expect(cardService.deleteCardById).toHaveBeenCalledWith(
        getCreditCardResponse.id,
        createdSafeUser.id,
      );

      expect(result).toEqual(void 0);
    });
  });

  describe('Validation - Invalid UUIDs in update and delete', () => {
    const invalidUUID = 'not-a-valid-uuid';

    it('should throw an error for invalid UUID in updateCard', async () => {
      const pipe = new ParseUUIDPipe({ version: '4' });

      await expect(() =>
        pipe.transform(invalidUUID, {
          type: 'param',
          metatype: String,
          data: 'id',
        }),
      ).rejects.toThrow('Validation failed (uuid v 4 is expected)');
    });

    it('should throw an error for invalid UUID in deleteCard', async () => {
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
