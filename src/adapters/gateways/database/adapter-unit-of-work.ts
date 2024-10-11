import { resolve } from '@/cross-cutting/dependency-injection/container';
import { TransactionalResource, UnitOfWork } from '@/application/ports/database/unit-of-work';
import { DatabaseError } from '@/adapters/errors/database-error';
import { DatabaseConnection } from '@/adapters/ports/database/database-connection';

export class AdapterUnitOfWork implements UnitOfWork {
  constructor(private readonly connection = resolve<DatabaseConnection>('DatabaseConnection')) {}

  async start(): Promise<void> {
    await this.connection.startTransaction();
  }
  async commit(): Promise<void> {
    await this.connection.commitTransaction();
  }
  async rollback(): Promise<void> {
    await this.connection.rollbackTransaction();
  }

  async withTransaction<T>(resources: TransactionalResource[], operation: () => Promise<T>): Promise<T> {
    resources.forEach(resource => resource.attachUnitOfWork(this));
    try {
      await this.start();
      const result = await operation();
      await this.commit();
      return result;
    } catch (error) {
      try {
        await this.rollback();
      } catch {
        throw new DatabaseError('An error occurred while processing the operation and during rollback.', error);
      }
      throw error;
    }
  }

  getConnection(): DatabaseConnection {
    return this.connection;
  }
}
