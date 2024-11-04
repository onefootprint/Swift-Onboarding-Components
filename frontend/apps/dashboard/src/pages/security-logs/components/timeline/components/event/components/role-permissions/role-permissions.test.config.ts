import { RoleKind, RoleScopeKind } from '@onefootprint/types';

import type { Role, RoleScope } from '@onefootprint/types';

export const roleFixture: Role = {
  id: '123',
  name: 'Support Role',
  scopes: [
    { kind: RoleScopeKind.read, data: 'read' } as RoleScope,
    { kind: RoleScopeKind.decrypt, data: 'name' } as RoleScope,
    { kind: RoleScopeKind.decrypt, data: 'email' } as RoleScope,
    { kind: RoleScopeKind.manualReview, data: 'review' } as RoleScope,
    { kind: RoleScopeKind.writeEntities, data: 'write' } as RoleScope,
  ],
  createdAt: '2024-01-01',
  isImmutable: false,
  numActiveUsers: 0,
  numActiveApiKeys: 0,
  kind: RoleKind.dashboardUser,
};

export const roleWithoutDecryptFixture: Role = {
  id: '456',
  name: 'Basic Role',
  scopes: [
    { kind: RoleScopeKind.read, data: 'read' } as RoleScope,
    { kind: RoleScopeKind.manualReview, data: 'review' } as RoleScope,
  ],
  createdAt: '2024-01-01',
  isImmutable: false,
  numActiveUsers: 0,
  numActiveApiKeys: 0,
  kind: RoleKind.dashboardUser,
};
