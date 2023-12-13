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
    assignKycDataCollected: 'dataConfirmed';
    assignObConfigAuth: 'sdkArgsReceived';
    assignSandboxOutcome: 'sandboxOutcomeReceived';
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
    | 'error'
    | 'incompatibleRequirements'
    | 'init'
    | 'initFailed'
    | 'liveness'
    | 'phoneIdentification'
    | 'process'
    | 'requirements'
    | 'residentialAddress'
    | 'sandboxOutcome'
    | 'smsChallenge'
    | 'ssn';
  tags: never;
}
