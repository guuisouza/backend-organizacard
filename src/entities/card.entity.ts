import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CardType } from '../shared/enums/card-type.enum';
import { Transaction } from './transaction.entity';

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cards)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({ nullable: false, length: 25 })
  brand: string;

  @Column({
    type: 'enum',
    enum: CardType,
    nullable: false,
  })
  card_type: CardType;

  @Column({ type: 'integer', nullable: true })
  credit_limit_in_cents: number | null;

  @Column({ type: 'integer', nullable: true })
  invoice_closing_day: number | null;

  @Column({ type: 'integer', nullable: true })
  invoice_due_day: number | null;

  @OneToMany(() => Transaction, (transaction) => transaction.card)
  transactions: Transaction[];

  @CreateDateColumn()
  created_at: Date;
}
