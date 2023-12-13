export enum RuleOp {
  eq = 'eq',
  notEq = 'not_eq',
}

export enum RuleAction {
  passWithManualReview = 'passWithManualReview',
  manualReview = 'manualReview',
  stepUp = 'stepUp',
  fail = 'fail',
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
