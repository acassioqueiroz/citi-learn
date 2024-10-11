import { Course } from '@/domain/aggregates/course';
import { CoursesRepository } from '@/application/ports/repositories/courses-repository';
import { DatabaseError } from '@/adapters/errors/database-error';
import { BaseTransacionalRepository } from '@/adapters/gateways/repositories/pg-base-transacional-repository';

export class PgCoursesRepository extends BaseTransacionalRepository implements CoursesRepository {
  async save(course: Course): Promise<void> {
    const query = `
    INSERT INTO courses (id, tenant_id, title, description, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (id) DO UPDATE
    SET title = EXCLUDED.title,
        description = EXCLUDED.description,
        created_at = EXCLUDED.created_at,
        updated_at = EXCLUDED.updated_at;
    `;
    const values = [course.getId(), course.getTenantId(), course.getTitle(), course.getDescription(), course.getCreatedAt(), course.getUpdatedAt()];
    try {
      await this.getConnection().query(query, values);
    } catch (error) {
      throw new DatabaseError('Could not save tenant', error);
    }
  }
  async getCourseById(id: string): Promise<Course | null> {
    const query = 'SELECT id, tenant_id, title, description, created_at, updated_at FROM courses WHERE id = $1';
    try {
      const rows = await this.getConnection().query(query, [id]);
      if (rows.length === 0) {
        return null;
      }
      const course = new Course(rows[0].id, rows[0].tenant_id, rows[0].title, rows[0].description, [], rows[0].created_at, rows[0].updated_at);
      return course;
    } catch (error) {
      throw new DatabaseError('Failed to get course', error);
    }
  }
}
