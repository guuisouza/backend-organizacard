import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 175 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  activation_token?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  google_id?: string;

  @CreateDateColumn()
  created_at: Date;
}
