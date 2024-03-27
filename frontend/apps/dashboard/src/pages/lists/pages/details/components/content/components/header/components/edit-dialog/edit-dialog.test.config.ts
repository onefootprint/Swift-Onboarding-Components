import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

const listFixture = {
  id: 'list_1',
  actor: {
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  createdAt: 'date',
  kind: ListKind.emailAddress,
  name: 'Email List',
  entriesCount: 0,
  usedInRules: false,
};

export const withListUpdateError = (listId: string) =>
  mockRequest({
    method: 'patch',
    path: `/org/lists/${listId}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withListUpdate = (listId: string) =>
  mockRequest({
    method: 'patch',
    path: `/org/lists/${listId}`,
    response: {},
  });

export const withList = (listId: string, data = listFixture) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: data,
  });
