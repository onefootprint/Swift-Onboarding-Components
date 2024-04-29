import type { RiskSignalRuleField, Rule } from '../data';

type EditRuleFields = {
  is_shadow?: boolean;
  name?: string;
  rule_expression?: RiskSignalRuleField[];
};

export type EditRuleRequest = {
  playbookId: string;
  ruleId: string;
  fields: EditRuleFields;
};

export type EditRuleResponse = Rule;
