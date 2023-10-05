import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetAuthRoleResponse } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_id_wL6XIWe26cRinucZrRK1yn',
    isPortable: true,
    kind: EntityKind.person,
    requiresManualReview: false,
    status: EntityStatus.pass,
    attributes: [],
    decryptableAttributes: [],
    startTimestamp: '2023-03-29T23:07:44.435194Z',
    decryptedAttributes: {},
    watchlistCheck: null,
  },
];

export const getOrgAuthRoleFixture: GetAuthRoleResponse = [
  {
    id: '_private_it_org_1',
    name: 'Footprint Live Integration Testing',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domain: null,
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: true,
  },
  {
    id: '_private_it_org_3',
    name: 'Footprint Integration Testing Foo',
    logoUrl: null,
    isSandboxRestricted: false,
    websiteUrl: null,
    companySize: null,
    domain: null,
    allowDomainAccess: false,
    isDomainAlreadyClaimed: null,
    isAuthMethodSupported: false,
  },
];

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'get',
    path: '/entities',
    response: {
      data: response,
      meta: {},
    },
  });

export const withOrgAuthRoles = () =>
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response: getOrgAuthRoleFixture,
  });
