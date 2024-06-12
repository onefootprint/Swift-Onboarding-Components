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
  {
    id: 'entry_3',
    data: 'test3@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_4',
    data: 'test4@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_5',
    data: 'test5@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_6',
    data: 'test6@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_7',
    data: 'test7@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_8',
    data: 'test8@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_9',
    data: 'test9@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
  {
    id: 'entry_10',
    data: 'test10@onefootprint.com',
    created_at: '2024-03-27T04:11:01.168287Z',
    actor: {
      kind: 'tenant_user',
      data: {
        id: 'orguser_AwKqqIuRVeHeJqFIRQk5rw',
      },
    },
  },
];

const listDetailsFixture = {
  id: 'list_1',
  actor: {
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  created_at: 'date',
  kind: ListKind.emailAddress,
  name: 'Email List',
  playbooks: [],
};

export const withDeleteError = (listId: string, entryId: string) =>
  mockRequest({
    method: 'delete',
    path: `/org/lists/${listId}/entries/${entryId}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withDelete = (listId: string, entryId: string) =>
  mockRequest({
    method: 'delete',
    path: `/org/lists/${listId}/entries/${entryId}`,
    response: {},
  });

export const withListDetails = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsFixture,
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
      message: 'Something went wrong',
    },
  });
