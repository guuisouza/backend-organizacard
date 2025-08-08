import { CardType } from '../enums/card-type.enum';

// Post/Create Card Response Interfaces
interface IBaseCardResponse {
  id: string;
  name: string;
  brand: string;
  card_type: CardType;
  user_id: string;
  created_at: Date;
}

export interface IDebitCardResponse extends IBaseCardResponse {
  card_type: CardType.DEBIT;
}

export interface ICreditCardResponse extends IBaseCardResponse {
  card_type: CardType.CREDIT;
  credit_limit_in_cents: number;
  invoice_closing_day: number;
  invoice_due_day: number;
}

export type ICreateCardResponse = IDebitCardResponse | ICreditCardResponse;

// Get Card Response Interfaces
export interface IGetBaseCardResponse {
  id: string;
  name: string;
  brand: string;
  card_type: CardType;
}

export interface IGetDebitCardResponse extends IGetBaseCardResponse {
  card_type: CardType.DEBIT;
}

export interface IGetCreditCardResponse extends IGetBaseCardResponse {
  card_type: CardType.CREDIT;
  credit_limit_in_cents: number;
  invoice_closing_day: number;
  invoice_due_day: number;
}
export type IGetCardResponse = IGetDebitCardResponse | IGetCreditCardResponse;
