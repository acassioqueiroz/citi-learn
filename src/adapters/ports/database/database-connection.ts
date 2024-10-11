/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DatabaseConnection {
  query(queryText: string, params?: any[]): Promise<any>;
  startTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  end(): Promise<void>;
}
