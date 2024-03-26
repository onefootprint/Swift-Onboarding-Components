import { mockRequest } from '@onefootprint/test-utils';
import type { List } from '@onefootprint/types';
import { ActorKind, ListKind } from '@onefootprint/types';

export const getListsFixture: List[] = [
  {
    id: '1',
    actor: {
      kind: ActorKind.footprint,
    },
    name: 'List 1',
    createdAt: '2022-09-19T16:24:35.367322Z',
    alias: 'my_list',
    kind: ListKind.emailAddress,
    entriesCount: 0,
    usedInRules: false,
  },
];

export const createdListFixture: List = {
  id: '2',
  actor: {
    kind: ActorKind.footprint,
  },
  name: 'List 2',
  createdAt: '2023-01-06T05:11:08.415924Z',
  kind: ListKind.ssn9,
  alias: 'my_list2',
  entriesCount: 0,
  usedInRules: false,
};

export const withLists = (data = getListsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response: data,
  });

export const withCreateList = (data = createdListFixture) =>
  mockRequest({
    method: 'post',
    path: '/org/lists',
    response: data,
  });
