import { Course } from '@/domain/aggregates/course';
import { CoursesRepository } from '@/application/ports/repositories/courses-repository';

export class CoursesRepositoryMemory implements CoursesRepository {
  attachUnitOfWork(): void {
    throw new Error('Method not implemented.');
  }
  courses: Course[] = [];
  async save(course: Course): Promise<void> {
    const existingIndex = this.courses.findIndex(c => c.getId() === course.getId());
    const courseAlreadyExists = existingIndex >= 0;
    if (courseAlreadyExists) {
      this.courses[existingIndex] = course;
      return;
    }
    this.courses.push(course);
    throw new Error('deu ruim');
  }

  async getCourseById(id: string): Promise<Course | null> {
    const course = this.courses.find(c => c.getId() === id);
    return course ?? null;
  }
}
