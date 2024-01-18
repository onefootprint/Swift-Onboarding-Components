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
    assignEmail: 'setEmail';
    assignEmailChallenge: 'setEmailChallenge';
    assignEmailReplaceChallenge: 'setEmailReplaceChallenge';
    assignKindToChallenge: 'goToChallenge' | 'setChallengeKind';
    assignPasskeyChallenge: 'setPasskeyChallenge';
    assignPhoneChallenge: 'setPhoneChallenge';
    assignPhoneNumber: 'setPhoneNumber';
    assignPhoneReplaceChallenge: 'setSmsReplaceChallenge';
    assignUserDashboard: 'updateUserDashboard';
    assignUserFound: 'identifyUserDone';
    assignVerifyToken: 'setVerifyToken';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'dashboard'
    | 'emailChallenge'
    | 'identifyUser'
    | 'init'
    | 'notFoundChallenge'
    | 'notFoundUser'
    | 'passkeyChallenge'
    | 'phoneChallenge'
    | 'success'
    | 'updateEmail'
    | 'updateEmailVerify'
    | 'updatePasskey'
    | 'updatePhone'
    | 'updatePhoneVerify'
    | 'userFound';
  tags: never;
}
