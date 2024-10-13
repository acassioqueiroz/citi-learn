import type { MigrationFn } from 'umzug';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';

export const up: MigrationFn<PgDatabaseConnection> = async ({ context: db }: { context: PgDatabaseConnection }) => {
  await db.query(`
    CREATE TYPE outbox_status AS ENUM ('pending', 'processing', 'published', 'failed');
    
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
    CREATE INDEX IDX_OUTBOX_CREATED_AT ON outbox_events (created_at);
  `);
};

export const down: MigrationFn<PgDatabaseConnection> = async ({ context: db }: { context: PgDatabaseConnection }) => {
  await db.query(`
    DROP INDEX IF EXISTS IDX_OUTBOX_CREATED_AT;
    DROP TABLE IF EXISTS outbox_events;
    DROP TYPE IF EXISTS outbox_status;
  `);
};
