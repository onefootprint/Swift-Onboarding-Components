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
    assignAvailableChallengeKinds: 'identified';
    assignEmail: 'identified' | 'identifyFailed';
    assignHasSyncablePassKey: 'identified';
    assignInitContext: 'initContextUpdated';
    assignPhone: 'identified' | 'identifyFailed';
    assignSandboxOutcome: 'sandboxOutcomeSubmitted';
    assignSuccessfulIdentifier: 'identified';
    assignUserFound: 'identified';
    reset: 'bootstrapDataInvalid' | 'identifyReset';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'bootstrapChallenge'
    | 'challenge'
    | 'configInvalid'
    | 'emailIdentification'
    | 'init'
    | 'initBootstrap'
    | 'initialized'
    | 'phoneIdentification'
    | 'sandboxOutcome'
    | 'success';
  tags: never;
}
