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
    assignAuthToken: 'identifiedWithSufficientScopes';
    assignChallengeData: 'challengeReceived';
    assignEmail: 'emailAdded';
    assignIdentifyResult: 'identifyResult';
    assignIdentifyToken: 'kbaSucceeded';
    assignPhoneNumber: 'phoneAdded';
    resetIdentifyState: 'navigatedToPrevPage';
    resetPhone: 'navigatedToPrevPage';
    resetToLoginWithNewAccount: 'loginWithDifferentAccount';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'addEmail'
    | 'addPhone'
    | 'authTokenInvalid'
    | 'challengeSelectOrPasskey'
    | 'emailChallenge'
    | 'emailIdentification'
    | 'init'
    | 'initAuthToken'
    | 'initBootstrap'
    | 'loginChallengeNotPossible'
    | 'phoneIdentification'
    | 'phoneKbaChallenge'
    | 'smsChallenge'
    | 'success';
  tags: never;
}
