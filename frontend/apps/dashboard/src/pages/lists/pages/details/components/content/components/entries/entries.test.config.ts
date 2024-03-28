import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

export const entriesFixture = [
  {
    id: 'entry_1',
    data: 'test@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_2',
    data: 'test2@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
];

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
  playbooks: [],
};

export const withDeleteError = (listId: string, entryId: string) =>
  mockRequest({
    method: 'delete',
    path: `/org/lists/${listId}/entries/${entryId}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withDelete = (listId: string, entryId: string) =>
  mockRequest({
    method: 'delete',
    path: `/org/lists/${listId}/entries/${entryId}`,
    response: {},
  });

export const withList = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listFixture,
  });

export const withListEntries = (listId: string, data = entriesFixture) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}/entries`,
    response: data,
  });

export const withListEntriesError = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}/entries`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
