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
      | 'declarationsSubmitted'
      | 'employmentSubmitted'
      | 'incomeSubmitted'
      | 'initDone'
      | 'investmentGoalsSubmitted'
      | 'netWorthSubmitted'
      | 'riskToleranceSubmitted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'completed'
    | 'confirm'
    | 'declarations'
    | 'employment'
    | 'income'
    | 'init'
    | 'investmentGoals'
    | 'netWorth'
    | 'redirectTo'
    | 'riskTolerance';
  tags: never;
}
