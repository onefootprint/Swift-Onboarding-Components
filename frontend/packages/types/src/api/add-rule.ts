import type { Rule, RuleAction, RuleField } from '../data';

type AddRuleFields = {
  action: RuleAction;
  name?: string;
  rule_expression?: RuleField[];
};

export type AddRuleRequest = {
  playbookId: string;
  fields: AddRuleFields;
};

export type AddRuleResponse = Rule;
