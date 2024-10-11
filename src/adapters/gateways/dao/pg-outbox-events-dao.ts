import { DatabaseError } from '@/adapters/errors/database-error';
import { AdvisoryLock } from '@/adapters/gateways/database/advisory-lock';
import { DatabaseTransactionalResource } from '@/adapters/gateways/repositories/database-transactional-resource';

export class PgOutboxEventsDAO extends DatabaseTransactionalResource {
  public async insert(
    id: string,
    channel: string,
    type: string,
    shardingKey: string,
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
    const values = [id, channel, type, shardingKey, payload, status, sentAt, createdAt, updatedAt];

    try {
      await this.getConnection().query(query, values);
    } catch (error) {
      throw new DatabaseError('Could not insert entry on outbox_events table', error);
    }
  }

  public async getPendingEvents(): Promise<Record<string, unknown>[]> {
    const query = `
      SELECT pg_advisory_xact_lock(${AdvisoryLock.OUTBOX_EVENTS_LOCK});

      SELECT id
      FROM outbox_events
      WHERE status = 'pending'
      ORDER BY created_at
      LIMIT 100;
    `;
    try {
      const rows = await this.getConnection().query(query);
      return rows;
    } catch (error) {
      throw new DatabaseError('Could not get pending events from outbox_events table', error);
    }
  }

  public async updateStatus(ids: string[], status: string): Promise<void> {
    const query = `
      UPDATE outbox_events
      SET status = $2
      WHERE id = ANY($1::uuid[])
    `;
    const values = [ids, status];
    try {
      await this.getConnection().query(query, values);
    } catch (error) {
      throw new DatabaseError('Could not update entries on outbox_events table', error);
    }
  }
}
