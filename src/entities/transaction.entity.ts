import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { TransactionCategoryType } from '../shared/enums/transaction-category.enum';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Card, (card) => card.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @Column({ type: 'enum', enum: TransactionCategoryType, nullable: false })
  category: TransactionCategoryType;

  @Column({ type: 'varchar', length: 150, nullable: false })
  description: string;

  @Column({ type: 'integer', nullable: false })
  amount_in_cents: number;

  @Column({ type: 'date', nullable: false })
  transaction_date: Date;

  // Fields only for credit cards
  @Column({ type: 'boolean', default: false })
  is_installment: boolean;

  @Column({ type: 'integer', nullable: true })
  installment_number: number | null;

  @Column({ type: 'integer', nullable: true })
  total_installments: number | null;

  @Column({ type: 'uuid', nullable: true })
  parent_transaction_id: string | null;

  @CreateDateColumn()
  created_at: Date;
}
