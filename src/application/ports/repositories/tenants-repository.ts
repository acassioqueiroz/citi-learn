import { Tenant } from '@/domain/entities/tenant';

export interface TenantsRepository {
  save(tenant: Tenant): Promise<void>;
  getTenantById(id: string): Promise<Tenant | null>;
}
