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
    assignDecryptedData: 'decryptUserDone';
    assignUserDashboard: 'updateUserDashboard';
    assignVerifyToken: 'setVerifyToken';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'dashboard'
    | 'identify'
    | 'init'
    | 'notFoundChallenge'
    | 'success'
    | 'updateEmail'
    | 'updatePasskey'
    | 'updatePhone';
  tags: never;
}
