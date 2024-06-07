import type { GetAuthRoleResponse } from '@onefootprint/types';

const moveTenantToFront = (tenants: GetAuthRoleResponse, targetTenantId: string) => {
  if (!Array.isArray(tenants) || tenants.length === 0) {
    return tenants;
  }
  const currTenantIndex = tenants.findIndex(tenant => tenant.id === targetTenantId);
  if (currTenantIndex === -1) {
    return tenants;
  }
  const currTenant = tenants[currTenantIndex];
  const remainingTenants = tenants.filter((_, index) => index !== currTenantIndex);
  return [currTenant, ...remainingTenants];
};

export default moveTenantToFront;
