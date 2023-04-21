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
    assignData:
      | 'brokerageEmploymentSubmitted'
      | 'declarationsSubmitted'
      | 'employmentSubmitted'
      | 'incomeSubmitted'
      | 'investmentGoalsSubmitted'
      | 'netWorthSubmitted'
      | 'riskToleranceSubmitted';
    assignInitialContext: 'receivedContext';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'brokerageEmployment'
    | 'completed'
    | 'declarations'
    | 'employment'
    | 'income'
    | 'init'
    | 'investmentGoals'
    | 'netWorth'
    | 'riskTolerance';
  tags: never;
}
