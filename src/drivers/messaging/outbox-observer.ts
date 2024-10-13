import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Observer } from '@/cross-cutting/observer';
import { EventPublisherWorker } from '@/drivers/messaging/event-publisher-worker';

export class OutboxObserver implements Observer {
  update(): void {
    const eventPublisherWorker = resolve<EventPublisherWorker>('EventPublisherWorker');
    eventPublisherWorker.scheduleEventFlush();
  }
}
