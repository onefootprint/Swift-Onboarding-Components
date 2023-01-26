import { mockRequest } from '@onefootprint/test-utils';
import { OrgRole } from '@onefootprint/types';

export const orgRolesFixture: OrgRole[] = [
  {
    id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Super',
    scopes: ['admin'],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
  },
  {
    id: 'orgrole_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: ['read'],
    createdAt: '2023-01-06T05:11:08.415924Z',
  },
];

export const orgRolesCreatedAtFixture = ['9/19/22, 4:24 PM', '1/6/23, 5:11 AM'];

export const orgRolesScopesFixture = ['Everything', 'Read'];

export const withOrgRoles = (orgRoles: OrgRole[] = orgRolesFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    response: {
      data: orgRoles,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withOrgRolesError = () =>
  mockRequest({
    method: 'get',
    path: '/org/roles',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withCreateOrgRole = (orgRole: OrgRole = orgRolesFixture[0]) =>
  mockRequest({
    method: 'post',
    path: '/org/roles',
    response: orgRole,
  });

export const withCreateOrgRoleError = () =>
  mockRequest({
    method: 'post',
    path: '/org/roles',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export default withOrgRoles;
