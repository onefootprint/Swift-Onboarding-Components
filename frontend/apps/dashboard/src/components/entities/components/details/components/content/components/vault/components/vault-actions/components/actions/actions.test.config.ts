import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus } from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isPortable: true,
  kind: EntityKind.person,
  attributes: [],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
};

export const withEntity = (entityId: string) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityId}`,
    statusCode: 200,
    response: entityFixture,
  });

export const withTrigger = (entityId: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/trigger`,
    statusCode: 200,
    response: {},
  });

export const withTriggerError = (entityId: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/trigger`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
