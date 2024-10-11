import { resolve } from '@/cross-cutting/dependency-injection/container';
import { TransactionalResource, UnitOfWork } from '@/application/ports/database/unit-of-work';
import { AdapterError } from '@/adapters/errors/adapter-error';
import { AdapterUnitOfWork } from '@/adapters/gateways/database/adapter-unit-of-work';
import { DatabaseConnection } from '@/adapters/ports/database/database-connection';

export class BaseTransacionalRepository implements TransactionalResource {
  private unitOfWork?: AdapterUnitOfWork;

  constructor(private connection = resolve<DatabaseConnection>('DatabaseConnection')) {}

  attachUnitOfWork(unitOfWork: UnitOfWork): void {
    if (unitOfWork instanceof AdapterUnitOfWork) {
      this.unitOfWork = unitOfWork;
      return;
    }
    throw new AdapterError('Invalid UnitOfWork implementation.');
  }

  protected getConnection(): DatabaseConnection {
    if (this.unitOfWork) {
      return this.unitOfWork.getConnection();
    }
    return this.connection;
  }
}
