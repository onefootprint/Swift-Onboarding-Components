import { mockRequest } from '@onefootprint/test-utils';
import { OrgRole } from '@onefootprint/types';

export const orgRolesFixture: OrgRole[] = [
  {
    id: 'orgrole_aExxJ5gSBpvqIJ2VcHH6J',
    name: 'Customer support',
    scopes: ['api_keys'],
    isImmutable: false,
    createdAt: '2022-11-18T00:04:11.368107Z',
    numActiveUsers: 4,
  },
  {
    id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Super',
    scopes: ['admin'],
    isImmutable: true,
    createdAt: '2023-01-25T21:47:22.679708Z',
    numActiveUsers: 1,
  },
  {
    id: 'orgrole_erflKNWEF13143EWRWELJN',
    name: 'Read only',
    isImmutable: true,
    scopes: ['read'],
    createdAt: '2023-01-06T04:33:34.272399Z',
    numActiveUsers: 3,
  },
];

export const orgRolesCreatedAtFixture = [
  '11/18/22, 12:04 AM',
  '1/25/23, 9:47 PM',
  '1/6/23, 4:33 AM',
];

export const orgRolesScopesFixture = ['Everything', 'Read', 'Manage Api Keys'];

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

export const withDisableOrgRole = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/roles/${id}/deactivate`,
    response: null,
  });

export const withDisableOrgRoleError = (id: string) =>
  mockRequest({
    method: 'post',
    path: `/org/roles/${id}/deactivate`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export default withOrgRoles;
