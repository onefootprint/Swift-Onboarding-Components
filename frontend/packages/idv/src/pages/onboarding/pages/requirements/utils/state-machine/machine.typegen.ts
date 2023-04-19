// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': { type: '' };
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
    markCollectedKycData: 'requirementCompleted' | 'xstate.stop';
    startDataCollection: '';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'additionalInfoRequired'
    | 'checkRequirements'
    | 'idDoc'
    | 'investorProfile'
    | 'kybData'
    | 'kycData'
    | 'router'
    | 'success'
    | 'transfer';
  tags: never;
}
