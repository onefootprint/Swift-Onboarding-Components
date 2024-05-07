import type { AddedRule, EditedRule, RuleBacktestingData } from '../data';

type EvaluateRulesFields = {
  add?: AddedRule[];
  delete?: string[];
  edit?: EditedRule[];
  endTimestamp: string;
  startTimestamp: string;
};

export type EvaluateRulesRequest = {
  playbookId: string;
  fields: EvaluateRulesFields;
};

export type EvaluateRulesResponse = RuleBacktestingData;
