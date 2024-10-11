import { Course } from '@/domain/aggregates/course';
import { TransactionalResource } from '@/application/ports/database/unit-of-work';

export interface CoursesRepository extends TransactionalResource {
  save(course: Course): Promise<void>;
  getCourseById(id: string): Promise<Course | null>;
}
