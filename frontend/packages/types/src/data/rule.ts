export enum RuleOp {
  eq = 'eq',
  notEq = 'not_eq',
}

export enum RuleAction {
  fail = 'fail',
  manualReview = 'manual_review',
  stepUp = 'step_up',
  passWithManualReview = 'pass_with_manual_review',
}

export type RuleField = {
  field: string;
  op: RuleOp;
  value: boolean;
};

export type Rule = {
  action: RuleAction;
  createdAt: string;
  isShadow: boolean;
  name?: string;
  ruleExpression: RuleField[];
  ruleId: string;
};

export type RuleResult = {
  result: boolean;
  rule: Rule;
};
