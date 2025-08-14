// data-source.ts
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { User } from '../src/entities/user.entity';
import { CreateUserTable1753204447420 } from './migrations/1753208616224-CreateUserTable';
import { CreateCardTable1753988772023 } from './migrations/1753988772023-CreateCardTable';
import { Card } from '../src/entities/card.entity';
import { CreateTransactionTable1755193652931 } from './migrations/1755193652931-CreateTransactionTable';
import { Transaction } from '../src/entities/transaction.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Card, Transaction],
  migrations: [
    CreateUserTable1753204447420,
    CreateCardTable1753988772023,
    CreateTransactionTable1755193652931,
  ],
  synchronize: false,
});
