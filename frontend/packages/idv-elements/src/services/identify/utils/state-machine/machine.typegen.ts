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
    assignEmail: 'identifyFailed';
    assignIdentifySuccessResult: 'identified';
    assignInitContext: 'initContextUpdated';
    assignPhone: 'identifyFailed';
    assignSandboxOutcome: 'sandboxOutcomeSubmitted';
    reset: 'bootstrapDataInvalid' | 'identifyReset';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'biometricChallenge'
    | 'configInvalid'
    | 'emailIdentification'
    | 'init'
    | 'initBootstrap'
    | 'initialized'
    | 'phoneIdentification'
    | 'sandboxOutcome'
    | 'smsChallenge'
    | 'success';
  tags: never;
}
