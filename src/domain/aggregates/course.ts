import { Section } from '@/domain/entities/section';
import { NotFoundError } from '@/domain/errors/not-found-error';
import { Description } from '@/domain/value-objects/description';
import { Title } from '@/domain/value-objects/title';
import { UniqueID } from '@/domain/value-objects/unique-id';

export class Course {
  private readonly id: string;
  private readonly tenantId: UniqueID;
  private readonly title: Title;
  private readonly description: Description;
  private readonly sections: Section[];
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(id: string, tenantId: string, title: string, description: string, sections: Section[], createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.tenantId = new UniqueID(tenantId);
    this.title = new Title(title);
    this.description = new Description(description);
    this.sections = sections;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(tenantId: string, title: string, description: string): Course {
    const sections: Section[] = [];
    const createdAt = new Date();
    const updatedAt = createdAt;
    return new Course(UniqueID.create().getValue(), tenantId, title, description, sections, createdAt, updatedAt);
  }

  getId() {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId.getValue();
  }

  getTitle(): string {
    return this.title.getValue();
  }

  getDescription(): string {
    return this.description.getValue();
  }

  getSections() {
    return this.sections;
  }

  addSection(title: string, description: string): Section {
    const section = Section.create(title, description);
    this.sections.push(section);
    this.updatedAt = new Date();
    return section;
  }

  removeSection(sectionId: string): Section {
    const indexOfSection = this.sections.findIndex(section => section.getId() === sectionId);
    if (indexOfSection === -1) {
      throw new NotFoundError('Section not found', 'SECTION_NOT_FOUND');
    }
    const [section] = this.sections.splice(indexOfSection, 1);
    this.updatedAt = new Date();
    return section;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
