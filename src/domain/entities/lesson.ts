import { Description } from '@/domain/value-objects/description';
import { Title } from '@/domain/value-objects/title';
import { UniqueID } from '@/domain/value-objects/unique-id';

export class Lesson {
  private readonly id: UniqueID;
  private readonly number: number;
  private readonly title: Title;
  private readonly description: Description;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(id: string, number: number, title: string, description: string, createdAt: Date, updatedAt: Date) {
    this.id = new UniqueID(id);
    this.number = number;
    this.title = new Title(title);
    this.description = new Description(description);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(lessonSequence: number, title: string, description: string) {
    const id = UniqueID.create().getValue();
    const createdAt = new Date();
    const updatedAt = createdAt;
    return new Lesson(id, lessonSequence, title, description, createdAt, updatedAt);
  }

  getId() {
    return this.id.getValue();
  }

  getNumber() {
    return this.number;
  }

  getTitle() {
    return this.title.getValue();
  }

  getDescription() {
    return this.description.getValue();
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
