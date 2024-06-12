import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

const listDetailsFixture = {
  id: 'list_1',
  actor: {
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  created_at: 'date',
  kind: ListKind.emailAddress,
  name: 'Email List',
  entries_count: 0,
  playbooks: [],
};

export const withListUpdateError = (listId: string) =>
  mockRequest({
    method: 'patch',
    path: `/org/lists/${listId}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withListUpdate = (listId: string) =>
  mockRequest({
    method: 'patch',
    path: `/org/lists/${listId}`,
    response: {},
  });

export const withListDetails = (listId: string, data = listDetailsFixture) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: data,
  });
