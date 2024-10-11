import { Domain } from '@/domain/value-objects/domain';
import { UniqueID } from '@/domain/value-objects/unique-id';

export class Tenant {
  constructor(
    private readonly id: UniqueID,
    private readonly name: string,
    private readonly domains: Domain[],
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(name: string, domains: string[]): Tenant {
    const domainsList = domains.map(domain => new Domain(domain));
    const createdAt = new Date();
    const updatedAt = createdAt;
    return new Tenant(UniqueID.create(), name, domainsList, createdAt, updatedAt);
  }

  getId() {
    return this.id.getValue();
  }

  getName() {
    return this.name;
  }

  getDomains() {
    return this.domains.map(domain => domain.getValue());
  }

  getCreatedAt() {
    return this.createdAt;
  }

  getUpdatedAt() {
    return this.updatedAt;
  }
}
