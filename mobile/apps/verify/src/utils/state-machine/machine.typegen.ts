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
    assignAuthToken: 'challengeSucceeded';
    assignChallengeData: 'challengeReceived';
    assignConfig: 'sdkArgsReceived';
    assignIdentifyResult: 'identified';
    assignKycData: 'dataSubmitted';
    assignObConfigAuth: 'sdkArgsReceived';
    reset: 'identifyReset';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'basicInformation'
    | 'completed'
    | 'confirm'
    | 'emailIdentification'
    | 'init'
    | 'initFailed'
    | 'phoneIdentification'
    | 'residentialAddress'
    | 'smsChallenge'
    | 'ssn';
  tags: never;
}
