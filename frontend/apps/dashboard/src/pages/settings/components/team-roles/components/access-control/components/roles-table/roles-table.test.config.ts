import { OrgRole, OrgRolePermissionKind } from '@onefootprint/types';

const OrgRolesFixture: OrgRole[] = [
  {
    id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    permissions: [{ kind: OrgRolePermissionKind.apiKeys }],
    createdAt: '9/19/22, 12:24 PM',
  },
  {
    id: 'orgrole_erflKNWEF13143EWRWELJN',
    name: 'Member',
    permissions: [{ kind: OrgRolePermissionKind.users }],
    createdAt: '8/12/22, 11:29 PM',
  },
];

export default OrgRolesFixture;
