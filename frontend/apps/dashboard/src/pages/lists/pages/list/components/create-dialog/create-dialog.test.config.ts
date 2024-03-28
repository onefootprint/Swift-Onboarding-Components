import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

export const getListsFixture = {
  data: [
    {
      id: '1',
      actor: {
        kind: ActorKind.footprint,
      },
      name: 'List 1',
      created_at: '2022-09-19T16:24:35.367322Z',
      alias: 'my_list',
      kind: ListKind.emailAddress,
      entries_count: 0,
      used_in_playbook: false,
    },
  ],
  meta: {
    count: 10,
  },
};

export const createdListFixture = {
  data: [
    {
      id: '2',
      actor: {
        kind: ActorKind.footprint,
      },
      name: 'List 2',
      created_at: '2023-01-06T05:11:08.415924Z',
      kind: ListKind.ssn9,
      alias: 'my_list2',
      entries_count: 0,
      used_in_playbook: false,
    },
  ],
  meta: {
    count: 10,
  },
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
