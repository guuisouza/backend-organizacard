// data-source.ts
import { DataSource } from 'typeorm';
import 'dotenv/config';
import { User } from '../src/entities/user.entity';
import { CreateUserTable1753204447420 } from './migrations/1753208616224-CreateUserTable';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User],
  migrations: [CreateUserTable1753204447420],
  synchronize: false,
});
