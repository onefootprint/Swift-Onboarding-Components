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
    assignIdDocOutcome: 'identifyCompleted';
    assignPhoneNumber: 'identifyCompleted';
    assignUserFound: 'identifyCompleted';
    assignValidationToken: 'onboardingCompleted';
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
    | 'onboarding';
  tags: never;
}
