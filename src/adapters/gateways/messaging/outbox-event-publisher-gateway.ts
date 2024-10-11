import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Notifier } from '@/cross-cutting/observer';
import { UniqueID } from '@/domain/value-objects/unique-id';
import { UnitOfWork } from '@/application/ports/database/unit-of-work';
import { EventPublisherGateway, PublishEvent } from '@/application/ports/messaging/event-publisher-gateway';
import { PgOutboxEventsDAO } from '@/adapters/gateways/dao/pg-outbox-events-dao';

export type OutboxStatus = 'pending' | 'processing' | 'sent' | 'failed';

export class OutboxEventPublisherGateway implements EventPublisherGateway {
  private unitOfWorkAttached = false;

  constructor(
    private outboxDAO = resolve<PgOutboxEventsDAO>('OutboxEventsDAO'),
    private outboxNotifier = resolve<Notifier>('OutboxNotifier'),
  ) {}

  public async publish({ channel, payload, shardingKey, type }: PublishEvent): Promise<void> {
    if (!this.unitOfWorkAttached) {
      throw new Error('Missing UnitOfWork.');
    }
    const id = UniqueID.create().getValue();
    const status: OutboxStatus = 'pending';
    const createdAt = new Date();
    const updatedAt = createdAt;
    const sentAt = undefined;
    const payloadString = JSON.stringify(payload);
    await this.outboxDAO.insert(id, channel, type, shardingKey, status, payloadString, sentAt, createdAt, updatedAt);
    this.outboxNotifier.notifyAll();
  }

  public attachUnitOfWork(unitOfWork: UnitOfWork): void {
    this.outboxDAO.attachUnitOfWork(unitOfWork);
    this.unitOfWorkAttached = true;
  }
}
