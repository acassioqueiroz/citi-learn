/* eslint-disable @typescript-eslint/no-require-imports */
import { register } from '@/cross-cutting/dependency-injection/container';
import { WinstonLogger } from '@/cross-cutting/logging/winston-logger';
import 'dotenv/config';
import { join } from 'path';
import { MigrationMeta, Umzug } from 'umzug';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';

const migrationFolder = join(__dirname, './src/drivers/migrations');

register('Logger', new WinstonLogger());

const postgresConnection = new PgDatabaseConnection();
const setupMigrations = async () => {
  await postgresConnection.query(`
    CREATE TABLE IF NOT EXISTS public.migrations
    (
        name character varying(255) COLLATE pg_catalog."default" NOT NULL,
        CONSTRAINT migrations_pkey PRIMARY KEY (name)
    )
  `);
};
const umzug = new Umzug({
  migrations: {
    glob: `${migrationFolder}/*.ts`,
    resolve: ({ name, path, context }) => {
      const migration = require(path!);
      return {
        name,
        up: async () => {
          await migration.up({ context });
        },
        down: async () => {
          await migration.down({ context });
        },
      };
    },
  },
  context: postgresConnection,
  storage: {
    async executed() {
      await setupMigrations();
      const rows = await postgresConnection.query('SELECT name FROM migrations');
      return rows.map((row: { name: string }) => row.name);
    },
    async logMigration({ name }: MigrationMeta) {
      await setupMigrations();
      await postgresConnection.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    },
    async unlogMigration({ name }: MigrationMeta) {
      await setupMigrations();
      await postgresConnection.query('DELETE FROM migrations WHERE name = $1', [name]);
    },
  },
  logger: console,
});
export { umzug };

if (require.main === module) {
  umzug.runAsCLI().finally(() => postgresConnection.end());
}
