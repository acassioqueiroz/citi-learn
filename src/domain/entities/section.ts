import { Lesson } from '@/domain/entities/lesson';
import { NotFoundError } from '@/domain/errors/not-found-error';
import { Description } from '@/domain/value-objects/description';
import { Title } from '@/domain/value-objects/title';
import { UniqueID } from '@/domain/value-objects/unique-id';

export class Section {
  private readonly id: UniqueID;
  private readonly title: Title;
  private readonly description: Description;
  private readonly lessons: Lesson[];
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(id: string, title: string, description: string, lessons: Lesson[], createdAt: Date, updatedAt: Date) {
    this.id = new UniqueID(id);
    this.title = new Title(title);
    this.description = new Description(description);
    this.lessons = lessons;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(title: string, description: string): Section {
    const createdAt = new Date();
    const updatedAt = createdAt;
    return new Section(UniqueID.create().getValue(), title, description, [], createdAt, updatedAt);
  }

  getId() {
    return this.id.getValue();
  }

  getTitle() {
    return this.title.getValue();
  }

  getDescription() {
    return this.description.getValue();
  }

  addLesson(title: string, description: string): Lesson {
    const lessonSequence = this.lessons.length;
    const lesson = Lesson.create(lessonSequence, title, description);
    this.lessons.push(lesson);
    this.updatedAt = new Date();
    return lesson;
  }

  removeLesson(lessonId: string): Lesson {
    const indexOfLesson = this.lessons.findIndex(lesson => lesson.getId() === lessonId);
    if (indexOfLesson === -1) {
      throw new NotFoundError('Lesson not found', 'LESSON_NOT_FOUND');
    }
    const [lesson] = this.lessons.splice(indexOfLesson, 1);
    this.updatedAt = new Date();
    return lesson;
  }

  getLessons() {
    return this.lessons;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
