import { TransactionalResource } from '@/application/ports/database/unit-of-work';

export interface PublishEvent {
  channel: string;
  type: string;
  shardingKey: string;
  payload: unknown;
}
export interface EventPublisherGateway extends TransactionalResource {
  publish(event: PublishEvent): Promise<void>;
}
