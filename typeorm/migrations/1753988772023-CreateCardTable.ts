import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCardTable1753988772023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_type_enum') THEN
          CREATE TYPE card_type_enum AS ENUM ('credit', 'debit');
        END IF;
      END$$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'cards',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '25',
            isNullable: false,
          },
          {
            name: 'card_type',
            type: 'card_type_enum',
            isNullable: false,
          },
          {
            name: 'credit_limit_in_cents',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'invoice_closing_day',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'invoice_due_day',
            type: 'integer',
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

    await queryRunner.createForeignKey(
      'cards',
      new TableForeignKey({
        name: 'fk_cards_user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('cards', 'fk_cards_user');
    await queryRunner.dropTable('cards');
    await queryRunner.query(`DROP TYPE IF EXISTS card_type_enum`);
  }
}
