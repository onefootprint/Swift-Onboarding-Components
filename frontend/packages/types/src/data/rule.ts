import type { DataIdentifier } from './di';
import type OnboardingStatus from './onboarding-status';

export enum OnboardingDecisionRuleAction {
  fail = 'fail',
  stepUpIdentitySsn = 'step_up.identity_proof_of_ssn',
  stepUpPoA = 'step_up.proof_of_address',
  stepUpIdentity = 'step_up.identity',
  manualReview = 'manual_review',
  passWithManualReview = 'pass_with_manual_review',
  pass = 'pass',
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

export enum BacktestingRuleAction {
  fail = 'fail',
  stepUp = 'step_up',
  manualReview = 'manual_review',
  passWithManualReview = 'pass_with_manual_review',
  pass = 'pass',
}

export enum RiskSignalRuleOp {
  eq = 'eq',
  notEq = 'not_eq',
}

export enum ListRuleOp {
  isIn = 'is_in',
  isNotIn = 'is_not_in',
}

export type RiskSignalRuleField = {
  field: string;
  op: RiskSignalRuleOp;
  value: boolean;
};

export type ListRuleField = {
  field: DataIdentifier | undefined;
  op: ListRuleOp;
  value: string;
};

export type Rule = {
  action: RuleAction;
  createdAt: string;
  isShadow: boolean;
  name?: string;
  ruleExpression: (RiskSignalRuleField | ListRuleField)[];
  ruleId: string;
};

export type AddedRule = {
  ruleAction: RuleAction;
  ruleExpression: (RiskSignalRuleField | ListRuleField)[];
};

export type EditedRule = {
  ruleId: string;
  ruleExpression: (RiskSignalRuleField | ListRuleField)[];
};

export type RuleResult = {
  result: boolean;
  rule: Rule;
};

export enum RuleResultGroup {
  isPresent = 'isPresent',
  isNotPresent = 'isNotPresent',
}

export type BacktestedOnboarding = {
  fpId: string;
  currentStatus: OnboardingStatus;
  backtestActionTriggered: OnboardingDecisionRuleAction | null;
  historicalActionTriggered: OnboardingDecisionRuleAction | null;
};

export type RuleBacktestingData = {
  results: BacktestedOnboarding[];
  stats: {
    countByHistoricalActionTriggered: Partial<
      Record<BacktestingRuleAction, number>
    >;
    countByBacktestActionTriggered: Partial<
      Record<BacktestingRuleAction, number>
    >;
    countByHistoricalAndBacktestActionTriggered: Partial<
      Record<
        BacktestingRuleAction,
        Partial<Record<BacktestingRuleAction, number>>
      >
    >;
    total: number;
  };
};
