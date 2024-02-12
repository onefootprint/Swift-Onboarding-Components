import type { RuleAction, RuleResult } from '../data';

export type GetEntityRuleSetResultRequest = {
  entityId: string;
  ruleSetResultId?: string;
};

export type GetEntityRuleSetResultResponse = {
  actionTriggered: RuleAction;
  createdAt: string;
  obConfigurationId: string;
  ruleResults: RuleResult[];
};
