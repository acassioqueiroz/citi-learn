import { TransactionalResource } from '@/application/ports/database/unit-of-work';

export interface PublishEvent {
  channel: string;
  type: string;
  shardingKey: string;
  payload: unknown;
}

export interface EventPublisher extends TransactionalResource {
  publish(event: PublishEvent): Promise<void>;
}
