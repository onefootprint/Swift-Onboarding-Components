import type { Rule, RuleField } from '../data';

type EditRuleFields = {
  is_shadow?: boolean;
  name?: string;
  rule_expression?: RuleField[];
};

export type EditRuleRequest = {
  playbookId: string;
  ruleId: string;
  fields: EditRuleFields;
};

export type EditRuleResponse = Rule;
