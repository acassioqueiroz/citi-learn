import { Course } from '@/domain/aggregates/course';
import { NotFoundError } from '@/domain/errors/not-found-error';
import { UniqueID } from '@/domain/value-objects/unique-id';

describe.only('Course Entity', () => {
  it('should create a course with valid data', () => {
    const tenantId = UniqueID.create().getValue();
    const title = 'Implantação de um sistema de processos eletrônicos em Prefeiutra';
    const description = 'Aprendendo a implementar um sistema de processos eletrônicos em uma Prefeitura';
    const course = Course.create(tenantId, title, description);
    const section = course.addSection('Estratégia de implantação', 'description');
    section.addLesson('Planejando a implantação', 'description');
    expect(course).toBeTruthy();
    expect(course.getSections().length).toBe(1);
    expect(section.getLessons().length).toBe(1);
  });

  it('should got an not found error when trying to remove a unknown section', () => {
    const tenantId = UniqueID.create().getValue();
    const title = 'Implantação de um sistema de processos eletrônicos em Prefeiutra';
    const description = 'Aprendendo a implementar um sistema de processos eletrônicos em uma Prefeitura';
    const course = Course.create(tenantId, title, description);
    const section = course.addSection('Estratégia de implantação', 'description');
    section.addLesson('Planejando a implantação', 'description');
    expect(() => course.removeSection('unknown')).toThrow(NotFoundError);
  });

  it('should remove a section successfully', () => {
    const tenantId = UniqueID.create().getValue();
    const title = 'Implantação de um sistema de processos eletrônicos em Prefeiutra';
    const description = 'Aprendendo a implementar um sistema de processos eletrônicos em uma Prefeitura';
    const course = Course.create(tenantId, title, description);
    const section = course.addSection('Estratégia de implantação', 'description');
    course.removeSection(section.getId());
    expect(section.getLessons().length).toBe(0);
  });

  it('should got an not found error when trying to remove a unknown lesson', () => {
    const tenantId = UniqueID.create().getValue();
    const title = 'Implantação de um sistema de processos eletrônicos em Prefeiutra';
    const description = 'Aprendendo a implementar um sistema de processos eletrônicos em uma Prefeitura';
    const course = Course.create(tenantId, title, description);
    const section = course.addSection('Estratégia de implantação', 'description');
    section.addLesson('Planejando a implantação', 'description');
    expect(() => section.removeLesson('unknown')).toThrow(NotFoundError);
  });

  it('should remove a lesson successfully', () => {
    const tenantId = UniqueID.create().getValue();
    const title = 'Implantação de um sistema de processos eletrônicos em Prefeiutra';
    const description = 'Aprendendo a implementar um sistema de processos eletrônicos em uma Prefeitura';
    const course = Course.create(tenantId, title, description);
    const section = course.addSection('Estratégia de implantação', 'description');
    const lesson = section.addLesson('Planejando a implantação', 'description');
    section.removeLesson(lesson.getId());
    expect(section.getLessons().length).toBe(0);
  });
});
