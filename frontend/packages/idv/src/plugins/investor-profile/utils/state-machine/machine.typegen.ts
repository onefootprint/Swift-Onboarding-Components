// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
    'xstate.stop': { type: 'xstate.stop' };
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
      | 'fundingSourcesSubmitted'
      | 'incomeSubmitted'
      | 'initDone'
      | 'investmentGoalsSubmitted'
      | 'netWorthSubmitted'
      | 'riskToleranceSubmitted';
    setDeclarationStateVisited: 'declarationsSubmitted' | 'navigatedToPrevPage' | 'xstate.stop';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'completed'
    | 'confirm'
    | 'declarations'
    | 'employment'
    | 'fundingSources'
    | 'income'
    | 'init'
    | 'investmentGoals'
    | 'netWorth'
    | 'redirectTo'
    | 'riskTolerance';
  tags: never;
}
