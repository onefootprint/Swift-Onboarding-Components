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
    assignAuthToken: 'challengeSucceeded' | 'hasSufficientScopes';
    assignChallengeData: 'challengeReceived';
    assignEmail: 'identifyFailed';
    assignIdentifySuccessResult: 'identified';
    assignPhone: 'identifyFailed';
    reset: 'bootstrapDataInvalid' | 'identifyReset';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'authTokenInvalid'
    | 'biometricChallenge'
    | 'emailChallenge'
    | 'emailIdentification'
    | 'init'
    | 'initAuthToken'
    | 'initBootstrap'
    | 'phoneIdentification'
    | 'smsChallenge'
    | 'success';
  tags: never;
}
