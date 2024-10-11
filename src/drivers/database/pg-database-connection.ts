/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Logger } from '@/cross-cutting/logging/logger';
import pgPromise, { IConnected, IDatabase, IMain } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { DatabaseError } from '@/adapters/errors/database-error';
import { DatabaseConnection } from '@/adapters/ports/database/database-connection';
import { postgresConfig } from '@/drivers/configs/postgres';

const pgp: IMain = pgPromise();

const connectionOptions = {
  connectionString: postgresConfig.uri,
  max: 300,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const db: IDatabase<any> = pgp(connectionOptions);

export class PgDatabaseConnection implements DatabaseConnection {
  private client: IConnected<any, IClient> | null = null;

  constructor(private logger = resolve<Logger>('Logger')) {
    this.logger.trace('Starting database connection...');
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (this.client) {
      this.logger.trace(`[Transaction Query] ${text}  ${params}`);
      return this.client.query(text, params);
    }
    this.logger.trace(`[Non-Transaction Query] ${text} ${params}`);
    return db.any(text, params);
  }
  async startTransaction(): Promise<void> {
    if (this.client) {
      throw new DatabaseError('A transaction is already in progress.');
    }
    this.logger.trace('Starting transaction...');
    this.client = await db.connect();
    try {
      await this.client.query('BEGIN');
      this.logger.trace('Transaction initialized and open.');
    } catch (error) {
      this.client.done();
      this.client = null;
      console.error('Failed to start transaction:', error);
      throw new DatabaseError('Failed to start transaction.', error);
    }
  }
  async commitTransaction(): Promise<void> {
    if (!this.client) {
      throw new DatabaseError('Cannot commit transaction: no transaction in progress.');
    }
    try {
      this.logger.trace('Committing transaction...');
      await this.client.query('COMMIT');
    } catch (error) {
      console.error('Failed to commit transaction:', error);
      throw new DatabaseError('Transaction commit failed.', error);
    } finally {
      this.client.done();
    }
  }
  async rollbackTransaction(): Promise<void> {
    if (!this.client) {
      throw new DatabaseError('Cannot rollback transaction: no transaction in progress.');
    }
    try {
      this.logger.trace('Rolling back transaction...');
      await this.client.query('ROLLBACK');
    } catch (error) {
      console.error('Failed to rollback transaction:', error);
      throw new DatabaseError('Transaction rollback failed.', error);
    } finally {
      this.client.done();
    }
  }
  async end(): Promise<void> {
    if (this.client) {
      this.client.done();
      this.client = null;
    }
    this.logger.trace('Ending database connection...');
    await db.$pool.end();
  }
}
