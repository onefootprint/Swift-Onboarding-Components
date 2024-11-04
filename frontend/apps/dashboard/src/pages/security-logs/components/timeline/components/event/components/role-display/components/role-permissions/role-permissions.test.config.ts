import { RoleScopeKind } from '@onefootprint/types';
import type { RoleScope } from '@onefootprint/types';

export const scopesFixture: RoleScope[] = [
  { kind: RoleScopeKind.read, data: 'read' } as RoleScope,
  { kind: RoleScopeKind.decrypt, data: 'name' } as RoleScope,
  { kind: RoleScopeKind.decrypt, data: 'email' } as RoleScope,
  { kind: RoleScopeKind.manualReview, data: 'review' } as RoleScope,
  { kind: RoleScopeKind.writeEntities, data: 'write' } as RoleScope,
];

export const scopesWithoutDecryptFixture: RoleScope[] = [
  { kind: RoleScopeKind.read, data: 'read' } as RoleScope,
  { kind: RoleScopeKind.manualReview, data: 'review' } as RoleScope,
];
