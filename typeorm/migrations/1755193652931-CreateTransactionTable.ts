import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateTransactionTable1755193652931 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_category_type_enum') THEN
          CREATE TYPE transaction_category_type_enum AS ENUM ('food', 'health', 'entertainment', 'education', 'transport', 'others');
        END IF;
      END$$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'transaction_category_type_enum',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'amount_in_cents',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'transaction_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'is_installment',
            type: 'boolean',
            default: false,
          },
          {
            name: 'installment_number',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'total_installments',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'parent_transaction_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'fk_transactions_card',
        columnNames: ['card_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cards',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'fk_transactions_card');
    await queryRunner.dropTable('transactions');
    await queryRunner.query(
      `DROP TYPE IF EXISTS transaction_category_type_enum`,
    );
  }
}
