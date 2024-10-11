import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Logger } from '@/cross-cutting/logging/logger';
import { CoreError } from '@/domain/errors/core-error';
import { UnitOfWork } from '@/application/ports/database/unit-of-work';
import { PgOutboxEventsDAO } from '@/adapters/gateways/dao/pg-outbox-events-dao';
import { eventPublisherWorkerConfig } from '@/drivers/configs/event-publisher-worker';
import { DriverError } from '@/drivers/errors/driver-error';

export class EventPublisherWorker {
  private readonly intervalInMs: number;
  private isRunning: boolean = false;
  private delayedStartTimeout?: NodeJS.Timeout;

  constructor(
    private logger = resolve<Logger>('Logger'),
    private unitOfWork = resolve<UnitOfWork>('UnitOfWork'),
    private outboxEventsDAO = resolve<PgOutboxEventsDAO>('OutboxEventsDAO'),
  ) {
    this.outboxEventsDAO.attachUnitOfWork(this.unitOfWork);
    this.intervalInMs = eventPublisherWorkerConfig.intervalInMs;
    this.logger.info('Initializing event publisher worker...');
  }

  private async processPendingEvents(): Promise<void> {
    try {
      await this.unitOfWork.start();
      const rows = await this.outboxEventsDAO.getPendingEvents();
      for (const row of rows) {
        try {
          this.logger.debug(`Publishing event ${row.id}...`);
        } catch (error) {
          throw new DriverError('An error occurred while publishing the event.', error);
        }
      }
      const ids = rows.map(row => row.id as string);
      await this.outboxEventsDAO.updateStatus(ids, 'published');
      await this.unitOfWork.commit();
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async handleError(error: unknown) {
    try {
      await this.unitOfWork.rollback();
    } catch (error) {
      throw new DriverError('An error occurred while processing the operation and during rollback.', error);
    }
    if (error instanceof CoreError) {
      throw error;
    }
    throw new DriverError('An error occurred while processing the operation.', error);
  }

  public start(): void {
    this.logger.trace('Starting event publisher worker...');
    setInterval(async () => {
      if (this.isRunning) {
        this.logger.trace('Event publisher worker is already running.');
        return;
      }
      this.isRunning = true;
      try {
        await this.processPendingEvents();
      } catch (error) {
        throw new DriverError('An error occurred while processing pending events.', error);
      } finally {
        this.isRunning = false;
      }
    }, this.intervalInMs);
  }

  public delayedStart(): void {
    this.logger.debug(`Starting event publisher worker in ${eventPublisherWorkerConfig.delayedStartIntervalInMs} ms...`);
    if (this.delayedStartTimeout) {
      clearTimeout(this.delayedStartTimeout);
    }
    this.delayedStartTimeout = setTimeout(async () => {
      if (this.isRunning) {
        this.logger.trace('Event publisher worker is already running.');
        return;
      }
      try {
        await this.processPendingEvents();
      } catch (error) {
        throw new DriverError('An error occurred while processing pending events.', error);
      } finally {
        this.isRunning = false;
      }
    }, eventPublisherWorkerConfig.delayedStartIntervalInMs);
  }
}
