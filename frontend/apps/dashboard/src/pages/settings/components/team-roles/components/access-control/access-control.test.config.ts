import { mockRequest } from '@onefootprint/test-utils';
import { OrgRole, OrgRolePermissionKind } from '@onefootprint/types';

const OrgRolesFixture: OrgRole[] = [
  {
    id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: [{ kind: OrgRolePermissionKind.apiKeys }],
    createdAt: '9/19/22, 12:24 PM',
  },
  {
    id: 'orgrole_erflKNWEF13143EWRWELJN',
    name: 'Member',
    scopes: [{ kind: OrgRolePermissionKind.users }],
    createdAt: '8/12/22, 11:29 PM',
  },
];

const withOrgRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    response: {
      data: {
        data: OrgRolesFixture,
        meta: {
          next: null,
          count: null,
        },
      },
    },
  });

export default withOrgRoles;
