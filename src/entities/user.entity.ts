import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

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

  @CreateDateColumn()
  created_at: Date;
}
