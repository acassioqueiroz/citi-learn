import { register, resolve } from '@/cross-cutting/dependency-injection/container';
import { WinstonLogger } from '@/cross-cutting/logging/winston-logger';
import { Notifier } from '@/cross-cutting/observer';
import { TenantsRepositoryMemory } from '@tests/unit/adapters/gateways/tenants-repository-memory';
import 'dotenv/config';
import { argv } from 'process';
import { CreateCourse } from '@/application/use-cases/create-course';
import { CreateCourseController } from '@/adapters/controllers/course-controller';
import { HttpController } from '@/adapters/controllers/http-controller';
import { PgOutboxEventsDAO } from '@/adapters/gateways/dao/pg-outbox-events-dao';
import { AdapterUnitOfWork } from '@/adapters/gateways/database/adapter-unit-of-work';
import { OutboxEventPublisherGateway } from '@/adapters/gateways/messaging/outbox-event-publisher-gateway';
import { PgCoursesRepository } from '@/adapters/gateways/repositories/pg-courses-repository';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';
import { ExpressServer } from '@/drivers/http/express-server';
import { EventPublisherWorker } from '@/drivers/messaging/event-publisher-worker';
import { OutboxObserver } from '@/drivers/messaging/outbox-observer';

const logger = new WinstonLogger();

function registerDependencies() {
  // cross-cutting
  register('Logger', logger);
  // drivers
  register('DatabaseConnection', () => new PgDatabaseConnection());
  // adapters
  register('UnitOfWork', () => new AdapterUnitOfWork());
  register('CoursesRepository', () => new PgCoursesRepository());
  register('TenantsRepository', () => new TenantsRepositoryMemory());
  register('OutboxEventsDAO', () => new PgOutboxEventsDAO());
  register('EventPublisherGateway', () => new OutboxEventPublisherGateway());
  // application
  register('CreateCourse', () => new CreateCourse());
  // Event Publisher
  const eventPublisherWorker = new EventPublisherWorker();
  const outboxObserver = new OutboxObserver();
  const outboxNotifier = new Notifier();
  outboxNotifier.addObserver(outboxObserver);
  register('EventPublisherWorker', eventPublisherWorker);
  register('OutboxNotifier', outboxNotifier);
  register('OutboxObserver', outboxObserver);
}

function startWorkers() {
  const eventPublisherWorker = resolve<EventPublisherWorker>('EventPublisherWorker');
  eventPublisherWorker.start();
}

function createControllers(): HttpController[] {
  return [new CreateCourseController()];
}

function startServer(controllers: HttpController[], port: number) {
  const expressServer = new ExpressServer();
  try {
    expressServer.attach(controllers);
    expressServer.listen(port, () => {
      logger.info(`Listening on port ${port}`);
    });
  } catch {
    expressServer.stopServer();
  }
}

function main() {
  registerDependencies();
  const controllers = createControllers();
  startServer(controllers, Number.parseInt(argv[2]) || 3000);
  startWorkers();
}

main();
