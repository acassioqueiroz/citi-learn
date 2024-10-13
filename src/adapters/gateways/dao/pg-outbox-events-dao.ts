import { UniqueID } from '@/domain/value-objects/unique-id';
import { DatabaseError } from '@/adapters/errors/database-error';
import { DatabaseTransactionalResource } from '@/adapters/gateways/repositories/database-transactional-resource';

export class PgOutboxEventsDAO extends DatabaseTransactionalResource {
  private static shardingKeys = Array(300)
    .fill(0)
    .map(() => UniqueID.create().getValue());

  public async insert(
    id: string,
    channel: string,
    type: string,
    _shardingKey: string,
    status: string,
    payload: unknown,
    sentAt: Date | undefined,
    createdAt: Date,
    updatedAt: Date,
  ): Promise<void> {
    const query = `
      INSERT INTO outbox_events (id, channel, type, sharding_key, payload, status, sent_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;
    const shardingKey = PgOutboxEventsDAO.shardingKeys[Math.floor(Math.random() * PgOutboxEventsDAO.shardingKeys.length)];
    const values = [id, channel, type, shardingKey, payload, status, sentAt, createdAt, updatedAt];

    try {
      await this.getConnection().query(query, values);
    } catch (error) {
      throw new DatabaseError('Could not insert entry on outbox_events table', error);
    }
  }

  public async getPendingEvents(batchSize: number): Promise<Record<string, unknown>[]> {
    const query = `
      SELECT id, channel, type, sharding_key, payload, status, sent_at, created_at, updated_at
      FROM outbox_events
      WHERE
        status = 'pending' AND 
        pg_try_advisory_xact_lock((ABS(hashtext(sharding_key)) % (2147483647 - 1000000)) + 1000000) = TRUE        
      ORDER BY created_at
      LIMIT $1
      FOR UPDATE SKIP LOCKED;
    `;
    const params = [batchSize];
    try {
      const rows = await this.getConnection().query(query, params);
      return rows;
    } catch (error) {
      throw new DatabaseError('Could not get pending events from outbox_events table', error);
    }
  }

  public async getPendingEventsCount(): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM outbox_events
      WHERE
        status = 'pending'
    `;
    try {
      const rows = await this.getConnection().query(query);
      const [{ count }] = rows;
      return count;
    } catch (error) {
      throw new DatabaseError('Could not get pending events count from outbox_events table', error);
    }
  }

  public async updateStatus(ids: string[], status: string): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const query = `      
      UPDATE outbox_events
      SET
        status = $2
      WHERE id = ANY($1::uuid[]);      
    `;
    const values = [ids, status];
    try {
      await this.getConnection().query(query, values);
    } catch (error) {
      throw new DatabaseError('Could not update entries on outbox_events table', error);
    }
  }

  public async setAsPublishedAndSentAt(ids: string[], sentAt: Date): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const query = `
      UPDATE outbox_events
      SET
        status = 'published', 
        sent_at = $2
      WHERE id = ANY($1::uuid[])
    `;
    const values = [ids, sentAt];
    try {
      await this.getConnection().query(query, values);
    } catch (error) {
      throw new DatabaseError('Could not update entries on outbox_events table', error);
    }
  }
}
