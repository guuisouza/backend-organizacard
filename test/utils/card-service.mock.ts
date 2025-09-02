import { CardService } from '../../src/modules/card/card.service';

export const cardServiceMock = {
  provide: CardService,
  useValue: {
    createCard: jest.fn(),
    getCards: jest.fn(),
    patchCardById: jest.fn(),
    deleteCardById: jest.fn(),
    findCardByIdOrThrow: jest.fn(),
  },
};
