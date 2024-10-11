import type { MigrationFn } from 'umzug';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';

export const up: MigrationFn<PgDatabaseConnection> = async ({ context: db }: { context: PgDatabaseConnection }) => {
  await db.query(`
    CREATE TYPE outbox_status AS ENUM ('pending', 'sent', 'failed');
  `);

  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE outbox_events (
      id UUID PRIMARY KEY,
      channel VARCHAR(255) NOT NULL,
      type VARCHAR(255),
      sharding_key VARCHAR(255) NOT NULL,
      payload TEXT NOT NULL,
      status outbox_status NOT NULL,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
};

export const down: MigrationFn<PgDatabaseConnection> = async ({ context: db }: { context: PgDatabaseConnection }) => {
  await db.query(`
    DROP TABLE IF EXISTS outbox_events;
    DROP TYPE IF EXISTS outbox_status;
  `);
};
