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
    assignAuthToken: 'challengeSucceeded' | 'identifiedWithSufficientScopes';
    assignChallengeData: 'challengeReceived';
    assignEmail: 'identifyFailed';
    assignIdentifySuccessResult: 'identified';
    assignIdentifyToken: 'kbaSucceeded';
    assignPhone: 'identifyFailed' | 'phoneAdded';
    assignSandboxId: 'sandboxIdChanged';
    reset: 'bootstrapDataInvalid' | 'identifyReset';
    resetIdentifyState: 'navigatedToPrevPage';
    resetPhone: 'navigatedToPrevPage';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'addPhone'
    | 'authTokenInvalid'
    | 'challengeSelectOrPasskey'
    | 'emailChallenge'
    | 'emailIdentification'
    | 'init'
    | 'initAuthToken'
    | 'initBootstrap'
    | 'never'
    | 'phoneIdentification'
    | 'phoneKbaChallenge'
    | 'smsChallenge'
    | 'success';
  tags: never;
}
