import type { Role } from '@onefootprint/types';
import { RoleKind } from '@onefootprint/types';

export const roleFixture: Role = {
  id: '1',
  kind: RoleKind.dashboardUser,
  name: 'Admin',
  scopes: [],
  createdAt: new Date().toISOString(),
  isImmutable: false,
  numActiveUsers: 0,
  numActiveApiKeys: 0,
};
