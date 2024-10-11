import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Course } from '@/domain/aggregates/course';
import { CoreError } from '@/domain/errors/core-error';
import { UniqueID } from '@/domain/value-objects/unique-id';
import { OperationalError } from '@/application/errors/operational-error';
import { UnitOfWork } from '@/application/ports/database/unit-of-work';
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
  ) {
    this.coursesRepository.attachUnitOfWork(this.unitOfWork);
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
    console.log(UniqueID.create().getValue());
    const course = Course.create(tenantId, title, description);
    try {
      await this.unitOfWork.start();
      await this.coursesRepository.save(course);
      await this.unitOfWork.commit();
    } catch (error) {
      await this.handleError(error);
    }
    return {
      courseId: course.getId(),
    };
  }
}
