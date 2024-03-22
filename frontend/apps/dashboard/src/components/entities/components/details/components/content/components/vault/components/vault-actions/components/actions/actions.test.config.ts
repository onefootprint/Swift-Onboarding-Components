import { mockRequest } from '@onefootprint/test-utils';
import type { Entity } from '@onefootprint/types';
import { EntityKind, EntityStatus, IdDI } from '@onefootprint/types';

export const entityId = 'fp_id_yCZehsWNeywHnk5JqL20u';
export const entityWithPhoneFixture: Entity = {
  id: entityId,
  isIdentifiable: true,
  kind: EntityKind.person,
  data: [],
  attributes: [IdDI.phoneNumber],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'obc_123',
    },
  ],
};

export const entityWithoutPhoneFixture: Entity = {
  id: entityId,
  isIdentifiable: true,
  kind: EntityKind.person,
  data: [],
  attributes: [],
  decryptableAttributes: [],
  startTimestamp: '2023-03-27T14:43:47.444716Z',
  lastActivityAt: '2023-03-27T14:43:47.444716Z',
  requiresManualReview: false,
  status: EntityStatus.pass,
  decryptedAttributes: {},
  watchlistCheck: null,
  hasOutstandingWorkflowRequest: false,
  label: null,
  workflows: [
    {
      createdAt: '2023-03-27T14:43:47.444716Z',
      playbookId: 'obc_123',
    },
  ],
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
    path: `/entities/${entityId}/triggers`,
    statusCode: 200,
    response: {
      link: 'http://footprint.link/#tok_xxx',
    },
  });

export const withTokenSendLink = (deliveryMethod: string) =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/token`,
    statusCode: 200,
    response: {
      deliveryMethod,
    },
  });

export const withTriggerError = () =>
  mockRequest({
    method: 'post',
    path: `/entities/${entityId}/triggers`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
