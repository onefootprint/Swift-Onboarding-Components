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
    assignEmail: 'setEmail';
    assignEmailReplaceChallenge: 'setEmailReplaceChallenge';
    assignPhoneNumber: 'setPhoneNumber';
    assignPhoneReplaceChallenge: 'setSmsReplaceChallenge';
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
    | 'updateEmailVerify'
    | 'updatePasskey'
    | 'updatePhone'
    | 'updatePhoneVerify';
  tags: never;
}
