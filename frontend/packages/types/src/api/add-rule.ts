import type { RiskSignalRuleField, Rule, RuleAction } from '../data';

type AddRuleFields = {
  action: RuleAction;
  name?: string;
  rule_expression?: RiskSignalRuleField[];
};

export type AddRuleRequest = {
  playbookId: string;
  fields: AddRuleFields;
};

export type AddRuleResponse = Rule;
