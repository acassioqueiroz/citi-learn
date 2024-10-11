import { Tenant } from '@/domain/entities/tenant';
import { TenantsRepository } from '@/application/ports/repositories/tenants-repository';

export class TenantsRepositoryMemory implements TenantsRepository {
  static tenants: Tenant[] = [];

  async save(tenant: Tenant): Promise<void> {
    const existingIndex = TenantsRepositoryMemory.tenants.findIndex(t => t.getId() === tenant.getId());
    const tenantAlreadyExists = existingIndex >= 0;
    if (tenantAlreadyExists) {
      TenantsRepositoryMemory.tenants[existingIndex] = tenant;
      return;
    }
    TenantsRepositoryMemory.tenants.push(tenant);
  }
  async getTenantById(id: string): Promise<Tenant | null> {
    const tenant = TenantsRepositoryMemory.tenants.find(t => t.getId() === id);
    return tenant ?? null;
  }

  attachUnitOfWork(): void {}
}
