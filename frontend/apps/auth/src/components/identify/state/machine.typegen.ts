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
    assignEmail: 'identifyFailed';
    assignIdentifySuccessResult: 'identified';
    assignPhone: 'identifyFailed';
    assignSandboxId: 'sandboxIdChanged';
    reset: 'bootstrapDataInvalid' | 'identifyReset';
    resetIdentifyState: 'navigatedToPrevPage';
    resetPhone: 'navigatedToPrevPage';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'challengeSelectOrPasskey'
    | 'emailChallenge'
    | 'emailIdentification'
    | 'init'
    | 'initBootstrap'
    | 'phoneIdentification'
    | 'smsChallenge'
    | 'success';
  tags: never;
}
