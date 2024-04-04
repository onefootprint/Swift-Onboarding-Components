import type { AddedRule, EditedRule, Rule } from '../data';

type EditRulesFields = {
  expectedRuleSetVersion: number;
  add?: AddedRule[];
  delete?: string[];
  edit?: EditedRule[];
};

export type EditRulesRequest = {
  playbookId: string;
  fields: EditRulesFields;
};

export type EditRulesResponse = Rule[];
