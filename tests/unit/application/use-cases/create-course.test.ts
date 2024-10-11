import { register, resolve } from '@/cross-cutting/dependency-injection/container';
import { WinstonLogger } from '@/cross-cutting/logging/winston-logger';
import { TenantsRepositoryMemory } from '@tests/unit/adapters/gateways/tenants-repository-memory';
import { Tenant } from '@/domain/entities/tenant';
import { CoursesRepository } from '@/application/ports/repositories/courses-repository';
import { TenantsRepository } from '@/application/ports/repositories/tenants-repository';
import { CreateCourse } from '@/application/use-cases/create-course';
import { AdapterUnitOfWork } from '@/adapters/gateways/database/adapter-unit-of-work';
import { PgCoursesRepository } from '@/adapters/gateways/repositories/pg-courses-repository';
import { DatabaseConnection } from '@/adapters/ports/database/database-connection';
import { PgDatabaseConnection } from '@/drivers/database/pg-database-connection';

describe('Create course', () => {
  let tenant: Tenant;
  register('DatabaseConnection', () => new PgDatabaseConnection());
  register('CoursesRepository', () => new PgCoursesRepository());
  register('TenantsRepository', () => new TenantsRepositoryMemory());
  register('UnitOfWork', () => new AdapterUnitOfWork());
  register('Logger', new WinstonLogger());

  beforeAll(async () => {
    const tenantsRepositoryMemory = resolve<TenantsRepository>('TenantsRepository');
    tenant = Tenant.create('Santander', ['santander.com.br']);
    await tenantsRepositoryMemory.save(tenant);
  });

  it('should create a course with valid data', async () => {
    const createCourse = new CreateCourse();
    const tenantId = tenant.getId();
    const { courseId } = await createCourse.execute({
      tenantId,
      title: 'Implantação de um sistema de processos eletrônico em Prefeituras',
      description: 'Aprendendo a implementar um sistema de processos eletrônico em uma Prefeituras',
    });
    const coursesRepositoryMemory = resolve<CoursesRepository>('CoursesRepository');
    const course = await coursesRepositoryMemory.getCourseById(courseId);
    expect(course).toBeTruthy();
    expect(course?.getTitle()).toBe('Implantação de um sistema de processos eletrônico em Prefeituras');
  });

  afterAll(async () => {
    const pgDatabaseConnnection = resolve<DatabaseConnection>('DatabaseConnection');
    await pgDatabaseConnnection.end();
  });
});
