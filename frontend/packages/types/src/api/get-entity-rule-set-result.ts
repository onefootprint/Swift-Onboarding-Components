import type { OnboardingDecisionRuleAction, RuleResult } from '../data';

export type GetEntityRuleSetResultRequest = {
  entityId: string;
  ruleSetResultId?: string;
};

export type GetEntityRuleSetResultResponse = {
  actionTriggered: OnboardingDecisionRuleAction;
  createdAt: string;
  obConfigurationId: string;
  ruleResults: RuleResult[];
};
