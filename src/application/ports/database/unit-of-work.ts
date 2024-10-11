export interface UnitOfWork {
  start(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface TransactionalResource {
  attachUnitOfWork(unitOfWork: UnitOfWork): void;
}
