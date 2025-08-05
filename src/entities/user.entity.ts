import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Card } from './card.entity';
import { AuthProvider } from '../shared/enums/auth-provider.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 100 })
  name: string;

  @Column({ nullable: false, unique: true, length: 175 })
  email: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  password: string | null;

  @Column({ nullable: false, default: false })
  is_active: boolean;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    nullable: false,
  })
  auth_provider: AuthProvider;

  @Column({ type: 'varchar', nullable: true })
  activation_token: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatar_url: string | null;

  @Column({ type: 'varchar', nullable: true })
  google_id: string | null;

  @OneToMany(() => Card, (card) => card.user)
  cards: Card[];

  @CreateDateColumn()
  created_at: Date;
}
