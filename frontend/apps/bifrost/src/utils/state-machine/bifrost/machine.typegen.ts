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
    assignSandboxOutcome: 'sandboxOutcomeSubmitted';
    assignStatus: 'onboardingCompleted';
    assignUserFound: 'identifyCompleted';
    assignValidationToken: 'onboardingCompleted';
    resetContext: 'reset';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'authenticationSuccess'
    | 'complete'
    | 'configInvalid'
    | 'identify'
    | 'init'
    | 'onboarding'
    | 'sandboxOutcome';
  tags: never;
}
