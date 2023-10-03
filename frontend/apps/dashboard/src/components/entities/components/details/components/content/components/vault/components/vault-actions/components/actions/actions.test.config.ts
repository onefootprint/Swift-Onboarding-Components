import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus, IdDI } from '@onefootprint/types';

export const entityId = 'fp_id_yCZehsWNeywHnk5JqL20u';
export const entityWithPhoneFixture: Entity = {
  id: entityId,
  isPortable: true,
  kind: EntityKind.person,
  attributes: [IdDI.phoneNumber],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
};

export const entityWithoutPhoneFixture: Entity = {
  id: entityId,
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

export const withEntity = (entityFixture: Entity) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entityId}`,
    statusCode: 200,
    response: entityFixture,
  });

export const withTrigger = () =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/trigger`,
    statusCode: 200,
    response: {},
  });

export const withTriggerError = () =>
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
