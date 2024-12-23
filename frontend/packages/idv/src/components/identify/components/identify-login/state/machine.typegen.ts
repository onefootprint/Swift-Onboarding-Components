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
    assignChallengeData: 'challengeReceived';
    assignAuthToken: 'challengeSucceeded';
    assignEmail: 'emailAdded';
    assignIdentifyToken: 'kbaSucceeded';
    assignPhoneNumber: 'phoneAdded';
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
    | 'init'
    | 'loginChallengeNotPossible'
    | 'phoneKbaChallenge'
    | 'smsChallenge'
    | 'success';
  tags: never;
}
