import { screen, userEvent } from '@onefootprint/test-utils';
import type { Rule } from '@onefootprint/types';
import { RuleAction, RuleOp } from '@onefootprint/types';

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
      triggered: [
        {
          ruleId: 'rule_MsUPlKcWagUEbpB4SIIzlp',
          action: RuleAction.fail,
          createdAt: '2023-12-05T23:37:22.943739Z',
          ruleExpression: [
            {
              field: 'subject_deceased',
              op: RuleOp.eq,
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
            { field: 'name_matches', op: RuleOp.notEq, value: true },
            { field: 'id_not_located', op: RuleOp.eq, value: true },
            { field: 'watchlist_hit_ofac', op: RuleOp.eq, value: true },
          ],
        },
      ],
      notTriggered: [
        {
          ruleId: 'rule_sufY6KAthSHuaWS9bzo8xt',
          action: RuleAction.fail,
          createdAt: '2020-12-05T23:37:22.943740Z',
          ruleExpression: [
            {
              field: 'id_flagged',
              op: RuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.manualReview]: {
      triggered: [],
      notTriggered: [
        {
          ruleId: 'rule_y0szjzoMrHRhevmzeTvHSV',
          action: RuleAction.manualReview,
          createdAt: '2023-11-27T23:36:30.695149Z',
          ruleExpression: [
            {
              field: 'watchlist_hit_ofac',
              op: RuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.passWithManualReview]: {
      triggered: [],
      notTriggered: [
        {
          ruleId: 'rule_QCzXqumr8OLk71ABBk9yEN',
          action: RuleAction.passWithManualReview,
          createdAt: '2023-12-05T23:37:22.943740Z',
          ruleExpression: [
            {
              field: 'document_is_permit_or_provisional_license',
              op: RuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.stepUpIdentitySsn]: {
      triggered: [],
      notTriggered: [
        {
          ruleId: 'rule_wcvtmwTlJRDG7y8kKt0ME5',
          action: RuleAction.stepUpIdentitySsn,
          createdAt: '2020-12-06T23:37:22.943740Z',
          ruleExpression: [
            {
              field: 'dob_does_not_match',
              op: RuleOp.eq,
              value: true,
            },
          ],
          isShadow: false,
        },
      ],
    },
    [RuleAction.stepUpPoA]: {
      triggered: [],
      notTriggered: [],
    },
    [RuleAction.stepUpIdentity]: {
      triggered: [],
      notTriggered: [],
    },
  },
};

export const selectRulesNotTriggered = async () => {
  const newOption = screen.getByRole('option', {
    name: 'Rules not triggered',
  });
  await userEvent.click(newOption);
};
