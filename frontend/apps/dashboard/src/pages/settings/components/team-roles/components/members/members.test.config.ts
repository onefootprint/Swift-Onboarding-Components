import { mockRequest } from '@onefootprint/test-utils';
import { OrgMember } from '@onefootprint/types';

export const orgMembersFixture: OrgMember[] = [
  {
    id: 'orguser_IJNDrl9WcqJi28ZUnpMlVO',
    email: 'jane.doe@acme.com',
    firstName: 'Jane',
    lastName: 'Doe',
    lastLoginAt: '2023-01-18T17:54:10.668420Z',
    createdAt: '2022-09-19T16:24:35.368337Z',
    roleName: 'Admin',
    roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
  },
  {
    id: 'orguser_k0yUYuO2fFCwMHFPShuK77',
    email: 'ayrton@acme.com',
    firstName: 'Ayrton',
    lastName: 'Larson',
    lastLoginAt: '2023-01-19T13:02:16.268743Z',
    createdAt: '2022-09-20T09:26:24.292959Z',
    roleName: 'Admin',
    roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
  },
  {
    id: 'orguser_1htKM3mwSfU6o5OIoXaSGO',
    email: 'gianluca@acme.com',
    firstName: 'Gianluca',
    lastName: 'Gilmore',
    lastLoginAt: '2023-01-17T20:14:10.836665Z',
    createdAt: '2022-09-20T16:14:00.347663Z',
    roleName: 'Admin',
    roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
  },
  {
    id: 'orguser_yTpSomOQgspCRDrdPfVpLN',
    email: 'rosie@acme.com',
    firstName: 'Rosie',
    lastName: 'Jennings',
    lastLoginAt: '2023-01-19T00:25:39.500544Z',
    createdAt: '2022-09-23T14:37:17.775986Z',
    roleName: 'Admin',
    roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
  },
  {
    id: 'orguser_HxUwoIsqyOuiWrfElXSsOV',
    email: 'teddy@acme.com',
    firstName: 'Teddy',
    lastName: 'Velez',
    lastLoginAt: '2023-01-13T12:57:00.098715Z',
    createdAt: '2022-09-26T17:39:52.509690Z',
    roleName: 'Admin',
    roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
  },
  {
    id: 'orguser_KJ6uPe6jjs2STG7BAdvznx',
    email: 'felix@acme.com',
    firstName: 'Felix',
    lastName: 'Tate',
    lastLoginAt: '2023-01-12T20:37:52.240432Z',
    createdAt: '2022-10-31T18:44:47.220049Z',
    roleName: 'Admin',
    roleId: 'orgrole_aExxJ6XgSBpvqIJ2VcHH6J',
  },
];

export const orgMembersRelativeTimeFixture = [
  '20 hours ago',
  '1 hour ago',
  '2 days ago',
  '14 hours ago',
  '6 days ago',
  '7 days ago',
];

export const withOrgMembers = () =>
  mockRequest({
    method: 'get',
    path: '/org/members',
    response: {
      data: orgMembersFixture,
      meta: {
        next: null,
        count: null,
      },
    },
  });

export const withOrgMembersError = () =>
  mockRequest({
    method: 'get',
    path: '/org/members',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export default withOrgMembers;
