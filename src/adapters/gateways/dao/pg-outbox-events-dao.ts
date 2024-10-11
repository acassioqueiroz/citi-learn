import { DatabaseError } from '@/adapters/errors/database-error';
import { DatabaseTransactionalResource } from '@/adapters/gateways/repositories/database-transactional-resource';

export type OutboxStatus = 'pending' | 'sent' | 'failed';

export class PgOutboxEventsDAO extends DatabaseTransactionalResource {
  async insert(
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
      throw new DatabaseError('Could not insert entry on outbox', error);
    }
  }
}
