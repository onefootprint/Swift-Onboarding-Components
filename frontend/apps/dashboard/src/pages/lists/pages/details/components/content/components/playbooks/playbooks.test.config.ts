import { mockRequest } from '@onefootprint/test-utils';
import { ActorKind, ListKind } from '@onefootprint/types';

const listDetailsWithNoPlaybooksFixture = {
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

const listDetailsFixture = {
  id: 'list_1',
  actor: {
    kind: ActorKind.footprint,
  },
  alias: 'my_list',
  created_at: 'date',
  kind: ListKind.emailAddress,
  name: 'Email List',
  playbooks: [
    {
      id: 'playbook_1',
      key: 'playbook_1',
      name: 'Playbook 1',
      rules: [
        {
          action: 'fail',
          createdAt: '01/01/2001',
          isShadow: false,
          ruleId: 'rule_1',
          name: 'rule_1',
          ruleExpression: [
            {
              field: 'some_rule',
              op: 'eq',
              value: true,
            },
          ],
        },
      ],
    },
    {
      id: 'playbook_2',
      key: 'playbook_2',
      name: 'Playbook 2',
      rules: [
        {
          action: 'fail',
          createdAt: '01/01/2001',
          isShadow: false,
          ruleId: 'rule_2',
          name: 'rule_2',
          ruleExpression: [
            {
              field: 'id.email',
              op: 'is_in',
              value: 'list_1',
            },
          ],
        },
      ],
    },
  ],
};

export const withListDetails = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsFixture,
  });

export const withListDetailsNoPlaybooks = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    response: listDetailsWithNoPlaybooksFixture,
  });

export const withListError = (listId: string) =>
  mockRequest({
    method: 'get',
    path: `/org/lists/${listId}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

const listsFixture = {
  data: [
    {
      id: '1',
      actor: {
        kind: ActorKind.footprint,
      },
      alias: 'my_list',
      created_at: 'date',
      kind: ListKind.emailAddress,
      name: 'Email List',
      entries_count: 0,
      used_in_playbook: false,
    },
    {
      id: '2',
      actor: {
        kind: ActorKind.footprint,
      },
      alias: 'my_list2',
      created_at: 'date',
      kind: ListKind.ssn9,
      name: 'SSN List',
      entries_count: 0,
      used_in_playbook: false,
    },
  ],
  meta: {
    count: 10,
  },
};

export const withLists = () =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response: listsFixture,
  });
