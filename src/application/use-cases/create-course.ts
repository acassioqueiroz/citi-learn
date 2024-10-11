import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Course } from '@/domain/aggregates/course';
import { CoreError } from '@/domain/errors/core-error';
import { OperationalError } from '@/application/errors/operational-error';
import { UnitOfWork } from '@/application/ports/database/unit-of-work';
import { EventPublisherGateway } from '@/application/ports/messaging/event-publisher-gateway';
import { CoursesRepository } from '@/application/ports/repositories/courses-repository';
import { TenantsRepository } from '@/application/ports/repositories/tenants-repository';

type Input = {
  tenantId: string;
  title: string;
  description: string;
};

type Output = {
  courseId: string;
};

export class CreateCourse {
  constructor(
    private unitOfWork: UnitOfWork = resolve<UnitOfWork>('UnitOfWork'),
    private tenantsRepository = resolve<TenantsRepository>('TenantsRepository'),
    private coursesRepository = resolve<CoursesRepository>('CoursesRepository'),
    private eventPublisher = resolve<EventPublisherGateway>('EventPublisherGateway'),
  ) {
    this.coursesRepository.attachUnitOfWork(this.unitOfWork);
    this.eventPublisher.attachUnitOfWork(this.unitOfWork);
  }

  private async handleError(error: unknown) {
    try {
      await this.unitOfWork.rollback();
    } catch {
      throw new OperationalError('An error occurred while processing the operation and during rollback.', error);
    }
    if (error instanceof CoreError) {
      throw error;
    }
    throw new OperationalError('An error occurred while processing the operation.', error);
  }

  async execute({ tenantId, title, description }: Input): Promise<Output> {
    const tenant = await this.tenantsRepository.getTenantById(tenantId);
    if (!tenant) {
      // throw new NotFoundError('Tenant not found', 'TENANT_NOT_FOUND');
    }
    const course = Course.create(tenantId, title, description);
    try {
      await this.unitOfWork.start();
      await this.coursesRepository.save(course);
      await this.eventPublisher.publish({
        channel: 'course',
        type: 'created',
        shardingKey: course.getId(),
        payload: {
          courseId: course.getId(),
          tenantId: course.getTenantId(),
          title: course.getTitle(),
          description: course.getDescription(),
        },
      });
      await this.unitOfWork.commit();
    } catch (error) {
      await this.handleError(error);
    }
    return {
      courseId: course.getId(),
    };
  }
}
