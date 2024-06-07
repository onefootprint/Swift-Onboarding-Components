import { mockRequest, screen, userEvent } from '@onefootprint/test-utils';
import type { Rule } from '@onefootprint/types';
import { ActorKind, ListKind, RiskSignalRuleOp, RuleAction } from '@onefootprint/types';

export const entityIdFixure = 'fp_id_yCZehsWNeywHnk5JqL20u';
export const obcIdFixure = 'ob_config_id_LZuy8k6ch31LcTEZvyk7YX';

export const ruleResultResponseFixture: Record<
  string,
  RuleAction | string | Record<RuleAction, Record<string, Rule[]>>
> = {
  actionTriggered: RuleAction.fail,
  obConfigurationId: obcIdFixure,
  ruleResults: {
    [RuleAction.fail]: {
      isPresent: [
        {
          ruleId: 'rule_MsUPlKcWagUEbpB4SIIzlp',
          action: RuleAction.fail,
          createdAt: '2023-12-05T23:37:22.943739Z',
          ruleExpression: [
            {
              field: 'subject_deceased',
              op: RiskSignalRuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
        {
          ruleId: 'rule_Zr3KN36uSLD9hTuiHbJHVz',
          action: RuleAction.fail,
          createdAt: '2021-11-26T16:52:52.535896Z',
          isShadow: false,
          ruleExpression: [
            { field: 'name_matches', op: RiskSignalRuleOp.notEq, value: true },
            { field: 'id_not_located', op: RiskSignalRuleOp.eq, value: true },
            {
              field: 'watchlist_hit_ofac',
              op: RiskSignalRuleOp.eq,
              value: true,
            },
          ],
        },
      ],
      isNotPresent: [
        {
          ruleId: 'rule_sufY6KAthSHuaWS9bzo8xt',
          action: RuleAction.fail,
          createdAt: '2020-12-05T23:37:22.943740Z',
          ruleExpression: [
            {
              field: 'id_flagged',
              op: RiskSignalRuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.manualReview]: {
      isPresent: [],
      isNotPresent: [
        {
          ruleId: 'rule_y0szjzoMrHRhevmzeTvHSV',
          action: RuleAction.manualReview,
          createdAt: '2023-11-27T23:36:30.695149Z',
          ruleExpression: [
            {
              field: 'watchlist_hit_ofac',
              op: RiskSignalRuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.passWithManualReview]: {
      isPresent: [],
      isNotPresent: [
        {
          ruleId: 'rule_QCzXqumr8OLk71ABBk9yEN',
          action: RuleAction.passWithManualReview,
          createdAt: '2023-12-05T23:37:22.943740Z',
          ruleExpression: [
            {
              field: 'document_is_permit_or_provisional_license',
              op: RiskSignalRuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.stepUpIdentitySsn]: {
      isPresent: [],
      isNotPresent: [
        {
          ruleId: 'rule_wcvtmwTlJRDG7y8kKt0ME5',
          action: RuleAction.stepUpIdentitySsn,
          createdAt: '2020-12-06T23:37:22.943740Z',
          ruleExpression: [
            {
              field: 'dob_does_not_match',
              op: RiskSignalRuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.stepUpPoA]: {
      isPresent: [],
      isNotPresent: [],
    },
    [RuleAction.stepUpIdentity]: {
      isPresent: [],
      isNotPresent: [],
    },
  },
};

export const listsFixture = {
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

export const selectRulesNotTriggered = async () => {
  const newOption = screen.getByRole('option', {
    name: 'Rules not present',
  });
  await userEvent.click(newOption);
};

export const withLists = (response = listsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/lists',
    response,
  });
