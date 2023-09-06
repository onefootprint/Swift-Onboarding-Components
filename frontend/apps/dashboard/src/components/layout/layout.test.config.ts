import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
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

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'get',
    path: '/entities',
    response: {
      data: response,
      meta: {},
    },
  });
