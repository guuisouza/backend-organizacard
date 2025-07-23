import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1753204447420 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider_enum') THEN
          CREATE TYPE auth_provider_enum AS ENUM ('local', 'google', 'apple');
        END IF;
      END$$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '175',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'auth_provider',
            type: 'auth_provider_enum',
            default: `'local'`,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'activation_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE IF EXISTS auth_provider_enum`);
  }
}
