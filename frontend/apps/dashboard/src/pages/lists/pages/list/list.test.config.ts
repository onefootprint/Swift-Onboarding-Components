import { mockRequest } from '@onefootprint/test-utils';
import type { List } from '@onefootprint/types';
import { ActorKind, ListKind } from '@onefootprint/types';

export const listsFixture: List[] = [
  {
    id: '1',
    actor: {
      kind: ActorKind.footprint,
    },
    alias: 'my_list',
    createdAt: 'date',
    kind: ListKind.emailAddress,
    name: 'Email List',
    entriesCount: 0,
    playbooks: [],
  },
  {
    id: '2',
    actor: {
      kind: ActorKind.footprint,
    },
    alias: 'my_list2',
    createdAt: 'date',
    kind: ListKind.ssn9,
    name: 'SSN List',
    entriesCount: 0,
    playbooks: [],
  },
];

export const withLists = () =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response: listsFixture,
  });

export const withListsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
