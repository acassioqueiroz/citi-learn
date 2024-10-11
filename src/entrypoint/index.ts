import { register } from '@/cross-cutting/dependency-injection/container';
import { WinstonLogger } from '@/cross-cutting/logging/winston-logger';
import { TenantsRepositoryMemory } from '@tests/unit/adapters/gateways/tenants-repository-memory';
import 'dotenv/config';
import { CreateCourse } from '@/application/use-cases/create-course';
import { CreateCourseController } from '@/adapters/controllers/course-controller';
import { HttpController } from '@/adapters/controllers/http-controller';
import { AdapterUnitOfWork } from '@/adapters/gateways/database/adapter-unit-of-work';
import { PgCoursesRepository } from '@/adapters/gateways/repositories/pg-courses-repository';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';
import { ExpressServer } from '@/drivers/http/express-server';

function registerDependencies() {
  register('Logger', new WinstonLogger());
  register('DatabaseConnection', () => new PgDatabaseConnection());
  register('UnitOfWork', () => new AdapterUnitOfWork());
  register('CoursesRepository', () => new PgCoursesRepository());
  register('TenantsRepository', () => new TenantsRepositoryMemory());
  register('CreateCourse', () => new CreateCourse());
}

function createControllers(): HttpController[] {
  return [new CreateCourseController()];
}

function start(controllers: HttpController[]) {
  const expressServer = new ExpressServer();
  try {
    expressServer.attach(controllers);
    expressServer.listen(3000, () => {
      console.log('Listening on port 3000');
    });
  } catch {
    expressServer.stopServer();
  }
}

function main() {
  registerDependencies();
  const controllers = createControllers();
  start(controllers);
}

main();