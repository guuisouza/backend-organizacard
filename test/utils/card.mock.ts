import { User } from '../../src/entities/user.entity';
import { CardType } from '../../src/shared/enums/card-type.enum';
import {
  IGetCreditCardResponse,
  IGetDebitCardResponse,
} from '../../src/shared/interfaces/card.interface';

export const createDebitCardDto = {
  name: 'Debit Card',
  brand: 'Visa',
  card_type: CardType.DEBIT,
};

export const createCreditCardDto = {
  name: 'Credit Card',
  brand: 'Visa',
  card_type: CardType.CREDIT,
  credit_limit_in_cents: 10000,
  invoice_closing_day: 15,
  invoice_due_day: 20,
};

export const createdCreditCard = {
  id: '21342342-zz1f-9921-8c54-6dde77236cd4',
  name: 'Credit Card',
  brand: 'Visa',
  card_type: CardType.CREDIT,
  credit_limit_in_cents: 10000,
  invoice_closing_day: 15,
  invoice_due_day: 20,
  created_at: new Date(),
  user: { id: '20134832-ed1f-4421-8c54-6dde77236fc4' } as User,
  transactions: [],
};

export const createdDebitCard = {
  id: '34542342-zz1f-9921-8c54-6dde77236cd4',
  name: 'Debit Card Visa',
  brand: 'Visa',
  card_type: CardType.DEBIT,
  credit_limit_in_cents: null,
  invoice_closing_day: null,
  invoice_due_day: null,
  created_at: new Date(),
  user: { id: '20134832-ed1f-4421-8c54-6dde77236fc4' } as User,
  transactions: [],
};

export const createdDebitCardResponse = {
  id: '34542342-zz1f-9921-8c54-6dde77236cd4',
  name: 'Debit Card Visa',
  brand: 'Visa',
  card_type: createdDebitCard.card_type,
  created_at: new Date(),
  user_id: '20134832-ed1f-4421-8c54-6dde77236fc4',
};

export const createdCreditCardResponse = {
  id: '21342342-zz1f-9921-8c54-6dde77236cd4',
  name: 'Credit Card',
  brand: 'Visa',
  card_type: createdCreditCard.card_type,
  created_at: new Date(),
  user_id: '20134832-ed1f-4421-8c54-6dde77236fc4',
  credit_limit_in_cents: 10000,
  invoice_closing_day: 15,
  invoice_due_day: 20,
};

export const getDebitCardResponse: IGetDebitCardResponse = {
  id: '34542342-zz1f-9921-8c54-6dde77236cd4',
  name: 'Debit Card Visa',
  brand: 'Visa',
  card_type: CardType.DEBIT,
};

export const getCreditCardResponse: IGetCreditCardResponse = {
  id: '21342342-zz1f-9921-8c54-6dde77236cd4',
  name: 'Credit Card',
  brand: 'Visa',
  card_type: CardType.CREDIT,
  credit_limit_in_cents: 10000,
  invoice_closing_day: 15,
  invoice_due_day: 20,
};
