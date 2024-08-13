export enum OverallOutcome {
  success = 'pass',
  manualReview = 'manual_review',
  fail = 'fail',
  useRulesOutcome = 'use_rules_outcome',
  stepUp = 'step_up',
}

export enum IdDocOutcome {
  success = 'pass',
  fail = 'fail',
  real = 'real',
}

export enum IdVerificationOutcome {
  real = 'real',
  simulated = 'simulated',
}
