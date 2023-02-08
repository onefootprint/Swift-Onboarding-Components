import { mockRequest } from '@onefootprint/test-utils';
import { OrgRole } from '@onefootprint/types';

export const orgRolesFixture: OrgRole[] = [
  {
    id: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
    name: 'Admin',
    scopes: ['admin'],
    isImmutable: true,
    createdAt: '2022-09-19T16:24:35.367322Z',
    numActiveUsers: 1,
  },
  {
    id: 'orgrole_erflKNWEF13143EWRWELJN',
    name: 'Member',
    isImmutable: true,
    scopes: ['read'],
    createdAt: '2023-01-06T05:11:08.415924Z',
    numActiveUsers: 0,
  },
];

export const withRoles = (orgRoles: OrgRole[] = orgRolesFixture) =>
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

export const withRolesError = () =>
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

export const withInviteMember = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    response: null,
  });

export const withInviteMemberError = () =>
  mockRequest({
    method: 'post',
    path: '/org/members',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
