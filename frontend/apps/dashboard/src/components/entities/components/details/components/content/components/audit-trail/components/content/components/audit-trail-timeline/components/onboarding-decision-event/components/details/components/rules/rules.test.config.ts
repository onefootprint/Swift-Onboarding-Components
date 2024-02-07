import type { Rule } from '@onefootprint/types';
import { RuleAction, RuleOp } from '@onefootprint/types';

export const entityIdFixure = 'fp_id_yCZehsWNeywHnk5JqL20u';
export const obcIdFixure = 'ob_config_id_LZuy8k6ch31LcTEZvyk7YX';

export const ruleResultResponseFixture: Record<
  string,
  | boolean
  | string
  | Partial<Record<RuleAction, Record<string, boolean | Rule[]>>>
> = {
  hasRuleResults: true,
  obConfigurationId: obcIdFixure,
  ruleResults: {
    [RuleAction.fail]: {
      isOutcome: true,
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
      isOutcome: false,
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
      isOutcome: false,
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
    [RuleAction.stepUp]: {
      isOutcome: false,
      triggered: [],
      notTriggered: [],
    },
  },
};
