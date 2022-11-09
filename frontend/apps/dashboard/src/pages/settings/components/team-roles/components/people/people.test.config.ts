import { mockRequest } from '@onefootprint/test-utils';
import { OrgMember } from '@onefootprint/types';

const OrgMembersFixture: OrgMember[] = [
  {
    id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
    email: 'belce@onefootprint.com',
    lastLoginAt: '2022-11-07T23:39:54.073430Z',
    createdAt: '11/3/22, 11:45 AM',
    roleName: 'Admin',
    roleId: 'orgrole_iGj82m9nFhtlVsNETOAZ7',
  },
  {
    id: 'orguser_034lwekfnwefwo3rBy',
    email: 'rafa@onefootprint.com',
    lastLoginAt: '2022-11-04T23:39:54.073430Z',
    createdAt: '11/2/22, 10:45 AM',
    roleName: 'Admin',
    roleId: 'orgrole_iGj82m9nFhtlVsNETOAZ7',
  },
];

const withOrgMembers = () =>
  mockRequest({
    method: 'get',
    path: '/org/members',
    response: {
      data: {
        data: OrgMembersFixture,
        meta: {
          next: null,
          count: null,
        },
      },
    },
  });

export default withOrgMembers;
