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
    assignAuthToken: 'identifyCompleted';
    assignEmail: 'identifyCompleted';
    assignInitContext: 'initContextUpdated';
    assignPhoneNumber: 'identifyCompleted';
    assignSandboxOutcome: 'sandboxOutcomeSubmitted';
    assignUserFound: 'identifyCompleted';
    assignValidationToken: 'onboardingCompleted';
    eraseAuthToken: 'reset';
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
    | 'onboarding'
    | 'sandboxOutcome'
    | 'sessionExpired';
  tags: never;
}
