import type { RuleAction, RuleResult } from '../data';

export type GetEntityRuleSetResultRequest = {
  id: string;
};

export type GetEntityRuleSetResultResponse = {
  actionTriggered: RuleAction;
  createdAt: string;
  obConfigurationId: string;
  ruleResults: RuleResult[];
};
