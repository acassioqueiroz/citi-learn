import { resolve } from '@/cross-cutting/dependency-injection/container';
import { UniqueID } from '@/domain/value-objects/unique-id';
import { UnitOfWork } from '@/application/ports/database/unit-of-work';
import { EventPublisher, PublishEvent } from '@/application/ports/messaging/EventPublisher';
import { OutboxStatus, PgOutboxEventsDAO } from '@/adapters/gateways/dao/pg-outbox-events-dao';

export class OutboxEventPublisher implements EventPublisher {
  private unitOfWorkAttached = false;

  constructor(private outboxDAO = resolve<PgOutboxEventsDAO>('OutboxEventsDAO')) {}

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
  }

  public attachUnitOfWork(unitOfWork: UnitOfWork): void {
    this.outboxDAO.attachUnitOfWork(unitOfWork);
    this.unitOfWorkAttached = true;
  }
}
