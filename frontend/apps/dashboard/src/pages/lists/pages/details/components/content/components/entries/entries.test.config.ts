import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

const entriesFixture = [
  {
    id: 'lst_JSO43Z80R3R5c1R47PRMZC',
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
    id: 'lst_692BYzICGJmIDxF6hrZLtt',
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
  id: '1',
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

export const withList = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listFixture,
  });

export const withListEntries = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}/entries`,
    response: entriesFixture,
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
