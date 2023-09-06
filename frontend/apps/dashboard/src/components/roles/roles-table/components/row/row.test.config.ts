import type { Role } from '@onefootprint/types';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';

const roleFixture: Role = {
  id: 'Role_aExxJ5gSBpvqIJ2VcHH6J',
  name: 'Customer support',
  scopes: [{ kind: RoleScopeKind.apiKeys }],
  isImmutable: false,
  createdAt: '2022-11-18T00:04:11.368107Z',
  numActiveUsers: 4,
  numActiveApiKeys: 0,
  kind: RoleKind.dashboardUser,
};

export default roleFixture;
