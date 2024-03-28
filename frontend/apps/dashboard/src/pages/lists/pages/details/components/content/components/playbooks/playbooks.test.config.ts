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
      name: 'Playbook 1',
      rules: [
        {
          ruleId: 'rule_1',
          ruleExpression: [
            {
              field: 'email',
              op: 'is',
              value: 'test@onefootprint.com',
            },
          ],
        },
      ],
    },
    {
      id: 'playbook_2',
      name: 'Playbook 2',
      rules: [
        {
          ruleId: 'rule_2',
          ruleExpression: [
            {
              field: 'email',
              op: 'is',
              value: 'test2@onefootprint.com',
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
      error: {
        message: 'Something went wrong',
      },
    },
  });
