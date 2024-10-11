import { MigrationFn } from 'umzug';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';

export const up: MigrationFn<PgDatabaseConnection> = async ({ context: db }: { context: PgDatabaseConnection }) => {
  db.query(
    `CREATE TABLE IF NOT EXISTS courses (
      id uuid PRIMARY KEY,
      tenant_id uuid,
      title VARCHAR(255) NOT NULL,
      description VARCHAR(2048) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE
    );`,
  );
};

export const down: MigrationFn<PgDatabaseConnection> = async ({ context: db }: { context: PgDatabaseConnection }) => {
  db.query(`DROP TABLE IF EXISTS courses;`);
};
