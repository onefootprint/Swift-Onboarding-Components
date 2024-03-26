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
    assignRequirements: 'onboardingRequirementsReceived';
    markCollectedKycData: 'error' | 'xstate.stop';
    markDidRunTransfer: 'error' | 'xstate.stop';
    startDataCollection: 'error' | 'xstate.stop';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'authorize'
    | 'checkRequirements'
    | 'error'
    | 'idDoc'
    | 'investorProfile'
    | 'kybData'
    | 'kycData'
    | 'liveness'
    | 'process'
    | 'router'
    | 'success'
    | 'transfer';
  tags: never;
}
