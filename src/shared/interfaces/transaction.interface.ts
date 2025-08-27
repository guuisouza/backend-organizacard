import { Transaction } from '../../entities/transaction.entity';

export interface InstallmentTransactionResponse {
  parent_transaction_id: string;
  installments: {
    installment_number: number;
    transaction_id: string;
    amount_in_cents: number;
    date: Date;
  }[];
}

export type CreateTransactionResponse =
  | { transaction_id: string }
  | InstallmentTransactionResponse;

export interface GetTransactionsByInvoiceResponse {
  start_date: Date;
  end_date: Date;
  transactions: Transaction[];
  total_card_balance: number;
}
