import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Between, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CardService } from '../card/card.service';
import { CardType } from '../../shared/enums/card-type.enum';
import {
  CreateTransactionResponse,
  GetTransactionsByInvoiceResponse,
  InstallmentTransactionResponse,
} from '../../shared/interfaces/transaction.interface';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private cardService: CardService,
  ) {}

  async createTransaction(
    data: CreateTransactionDto,
    cardId: string,
  ): Promise<CreateTransactionResponse> {
    const card = await this.cardService.findCardByIdOrThrow(cardId);

    if (card.card_type === CardType.CREDIT && data.is_installment) {
      return this.createInstallmentTransactions(
        data,
        cardId,
        card.invoice_closing_day!,
      );
    }

    return this.createSingleTransaction(data, cardId);
  }

  private async createSingleTransaction(
    data: CreateTransactionDto,
    cardId: string,
  ): Promise<{ transaction_id: string }> {
    const transaction = this.transactionsRepository.create({
      ...data,
      card: { id: cardId },
      transaction_date: new Date(data.transaction_date),
      total_installments: null,
    });

    const saved = await this.transactionsRepository.save(transaction);
    return { transaction_id: saved.id };
  }

  private async createInstallmentTransactions(
    data: CreateTransactionDto,
    cardId: string,
    invoiceClosingDay: number,
  ): Promise<InstallmentTransactionResponse> {
    const {
      amount_in_cents,
      total_installments,
      description,
      transaction_date,
    } = data;

    const installmentValue = Math.floor(amount_in_cents / total_installments!);
    const firstInstallmentDate = new Date(transaction_date);

    const firstInstallment = this.transactionsRepository.create({
      ...data,
      card: { id: cardId },
      amount_in_cents: installmentValue,
      transaction_date: firstInstallmentDate,
      is_installment: true,
      installment_number: 1,
    });

    const savedFirst = await this.transactionsRepository.save(firstInstallment);

    let currentDate = this.getNextInvoiceDate(
      invoiceClosingDay,
      firstInstallmentDate,
    );
    const otherInstallments: Transaction[] = [];

    for (let i = 2; i <= total_installments!; i++) {
      const installment = this.transactionsRepository.create({
        ...data,
        card: { id: cardId },
        amount_in_cents: installmentValue,
        description: `${description} - parcela ${i}/${total_installments}`,
        transaction_date: currentDate,
        is_installment: true,
        installment_number: i,
        parent_transaction_id: savedFirst.id,
      });

      otherInstallments.push(installment);
      currentDate = this.getNextInvoiceDate(invoiceClosingDay, currentDate);
    }

    await this.transactionsRepository.save(otherInstallments);

    return {
      parent_transaction_id: savedFirst.id,
      installments: [
        {
          installment_number: 1,
          transaction_id: savedFirst.id,
          amount_in_cents: savedFirst.amount_in_cents,
          date: savedFirst.transaction_date,
        },
        ...otherInstallments.map((installment) => ({
          installment_number: installment.installment_number!,
          transaction_id: installment.id,
          amount_in_cents: installment.amount_in_cents,
          date: installment.transaction_date,
        })),
      ],
    };
  }

  private getNextInvoiceDate(invoiceClosingDay: number, referenceDate: Date) {
    const date = new Date(referenceDate);
    date.setDate(invoiceClosingDay + 1);
    if (date <= referenceDate) {
      date.setMonth(date.getMonth() + 1);
    }
    return date;
  }

  async getCardTransactionsByCurrentInvoice(
    cardId: string,
  ): Promise<GetTransactionsByInvoiceResponse> {
    const card = await this.cardService.findCardByIdOrThrow(cardId);
    const { card_type, invoice_closing_day } = card;

    let startDate: Date;
    let endDate: Date;

    const today = new Date();

    if (card_type === CardType.DEBIT) {
      // Débito → intervalo fixo: mês atual
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      const afterClosing = today.getDate() > invoice_closing_day!;
      const baseMonth = afterClosing ? today.getMonth() : today.getMonth() - 1;

      startDate = new Date(
        today.getFullYear(),
        baseMonth,
        invoice_closing_day! + 1,
      );
      endDate = new Date(
        today.getFullYear(),
        baseMonth + 1,
        invoice_closing_day!,
      );
    }

    const transactions = await this.transactionsRepository.find({
      where: {
        card: { id: cardId },
        transaction_date: Between(startDate, endDate),
      },
      order: {
        transaction_date: 'DESC',
      },
    });

    if (!transactions || transactions.length === 0) {
      return {
        start_date: startDate,
        end_date: endDate,
        transactions: [],
        total_card_balance: 0,
      };
    }

    const totalCardBalance = transactions.reduce((acc, transaction) => {
      return acc + transaction.amount_in_cents;
    }, 0);

    return {
      start_date: startDate,
      end_date: endDate,
      transactions,
      total_card_balance: totalCardBalance,
    };
  }
}
