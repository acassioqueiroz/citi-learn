import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Logger } from '@/cross-cutting/logging/logger';
import { CoreError } from '@/domain/errors/core-error';
import { UnitOfWork } from '@/application/ports/database/unit-of-work';
import { PgOutboxEventsDAO } from '@/adapters/gateways/dao/pg-outbox-events-dao';
import { eventPublisherWorkerConfig } from '@/drivers/configs/event-publisher-worker';
import { DriverError } from '@/drivers/errors/driver-error';

class EventPublisherTransactionFactory {
  public static create(): { unitOfWork: UnitOfWork; outboxEventsDAO: PgOutboxEventsDAO } {
    const unitOfWork = resolve<UnitOfWork>('UnitOfWork');
    const outboxEventsDAO = resolve<PgOutboxEventsDAO>('OutboxEventsDAO');
    outboxEventsDAO.attachUnitOfWork(unitOfWork);
    return { unitOfWork, outboxEventsDAO };
  }
}

export class EventPublisherWorker {
  private delayedStartTimeout: NodeJS.Timeout | null = null;
  private pendingFlushCount: number = 0;
  private isRunning: boolean = false;

  constructor(private logger = resolve<Logger>('Logger')) {}

  private async processPendingEvents(): Promise<void> {
    const outboxEventsDAO = resolve<PgOutboxEventsDAO>('OutboxEventsDAO');
    let pendingEventsCount: number = -1;
    do {
      if (pendingEventsCount > 0 || pendingEventsCount === -1) {
        await this.processPendingEventsBatch();
      }
      pendingEventsCount = await outboxEventsDAO.getPendingEventsCount();
    } while (pendingEventsCount > eventPublisherWorkerConfig.batchSize * eventPublisherWorkerConfig.eventProcessingBatchCompletionThreshold);
  }

  private async processPendingEventsBatch(): Promise<void> {
    const { unitOfWork, outboxEventsDAO } = EventPublisherTransactionFactory.create();
    try {
      await unitOfWork.start();
      const rows = await outboxEventsDAO.getPendingEvents(eventPublisherWorkerConfig.batchSize);
      const eventsIds = rows.map(row => row.id as string);
      await outboxEventsDAO.updateStatus(eventsIds, 'processing');
      for (const row of rows) {
        try {
          this.logger.trace(`Publishing event ${row.id}...`);
        } catch (error) {
          throw new DriverError('An error occurred while publishing the event.', error);
        }
      }
      const sentAt = new Date();
      const ids = rows.map(row => row.id as string);
      await outboxEventsDAO.setAsPublishedAndSentAt(ids, sentAt);
      await unitOfWork.commit();
    } catch (error) {
      try {
        await unitOfWork.rollback();
      } catch (rollBackError) {
        throw new DriverError('An error occurred while processing the operation and during rollback.', rollBackError);
      }
      if (error instanceof CoreError) {
        this.logger.error(error.stack || error.message);
        throw error;
      }
      throw new DriverError('An error occurred while processing the operation.', error);
    }
  }

  public start(): void {
    setInterval(() => {
      this.flushEvents().catch(() => {
        this.logger.error('An error occurred while flushing events:');
      });
    }, eventPublisherWorkerConfig.intervalInMs);
  }

  public scheduleEventFlush(): void {
    this.pendingFlushCount++;
    if (this.delayedStartTimeout) {
      clearTimeout(this.delayedStartTimeout);
    }
    if (this.pendingFlushCount >= eventPublisherWorkerConfig.maxPendingFlushCount) {
      this.flushEvents().catch(() => {
        this.logger.error('An error occurred while flushing events:');
      });
      this.pendingFlushCount = 0;
    } else {
      this.delayedStartTimeout = setTimeout(() => {
        this.flushEvents().catch(() => {
          this.logger.error('An error occurred while flushing events:');
        });
      }, eventPublisherWorkerConfig.delayedStartIntervalInMs);
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.isRunning) {
      this.logger.trace('Event publisher worker is already running.');
      return;
    }
    this.isRunning = true;
    try {
      await this.processPendingEvents();
    } catch (error) {
      this.logger.error('An error occurred while processing pending events.');
      if (error instanceof Error) this.logger.error(error.stack || error.message);
    } finally {
      this.isRunning = false;
    }
  }
}
