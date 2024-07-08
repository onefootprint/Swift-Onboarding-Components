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
    assignAuthToken: 'authTokenChanged' | 'identifyCompleted';
    assignDeviceResponseJson: 'receivedDeviceResponseJson';
    assignIdentifyResult: 'identifyCompleted';
    assignInitContext: 'initContextUpdated';
    assignSandboxOutcome: 'sandboxOutcomeSubmitted';
    assignValidationToken: 'onboardingCompleted';
    eraseAuthToken: 'reset';
    incrementRetries: 'reset';
    resetContext: 'reset';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'complete'
    | 'configInvalid'
    | 'expired'
    | 'identify'
    | 'init'
    | 'initConfigFailed'
    | 'onboarding'
    | 'sandboxOutcome'
    | 'sessionExpired';
  tags: never;
}
