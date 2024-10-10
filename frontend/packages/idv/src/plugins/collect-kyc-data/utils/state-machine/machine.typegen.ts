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
    assignAuthToken: 'stepUpCompleted';
    assignConfirmScreenVisibility: 'confirmFailed';
    assignData: 'dataSubmitted' | 'decryptedData';
    assignInitialData: 'initialized';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'addVerificationEmail'
    | 'addVerificationPhone'
    | 'basicInformation'
    | 'completed'
    | 'confirm'
    | 'email'
    | 'init'
    | 'residentialAddress'
    | 'router'
    | 'ssn'
    | 'usLegalStatus';
  tags: never;
}
