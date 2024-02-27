export enum RuleOp {
  eq = 'eq',
  notEq = 'not_eq',
}

export enum RuleAction {
  fail = 'fail',
  stepUpIdentitySsn = 'step_up.identity_proof_of_ssn',
  stepUpPoA = 'step_up.proof_of_address',
  stepUpIdentity = 'step_up.identity',
  manualReview = 'manual_review',
  passWithManualReview = 'pass_with_manual_review',
}

export enum RuleActionSection {
  fail = 'fail',
  stepUp = 'step_up',
  manualReview = 'manual_review',
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

export enum RuleResultGroup {
  triggered = 'triggered',
  notTriggered = 'notTriggered',
}
