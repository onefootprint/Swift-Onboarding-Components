// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    assignBrokerageEmployment: 'brokerageEmploymentSubmitted';
    assignConflictOfInterest: 'conflictOfInterestSubmitted';
    assignEmployment: 'employmentSubmitted';
    assignIncome: 'incomeSubmitted';
    assignInvestmentGoals: 'investmentGoalsSubmitted';
    assignNetWorth: 'netWorthSubmitted';
    assignRiskTolerance: 'riskToleranceSubmitted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'brokerageEmployment'
    | 'completed'
    | 'conflictOfInterest'
    | 'employment'
    | 'income'
    | 'init'
    | 'investmentGoals'
    | 'netWorth'
    | 'riskTolerance';
  tags: never;
}
