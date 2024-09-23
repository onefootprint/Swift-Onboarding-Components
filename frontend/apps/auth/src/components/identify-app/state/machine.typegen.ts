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
    assignIdentificationResult: 'identifyCompleted';
    assignInitProps: 'initPropsReceived';
    assignPasskeyRegistrationWindow: 'passkeyRegistrationTabOpened';
    assignScopedAuthToken: 'scopedAuthTokenReceived';
    assignValidationToken: 'onboardingValidationCompleted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'done'
    | 'identify'
    | 'init'
    | 'invalidAuthConfig'
    | 'invalidConfig'
    | 'onboardingValidation'
    | 'passkeyCancelled'
    | 'passkeyError'
    | 'passkeyOptionalRegistration'
    | 'passkeyProcessing'
    | 'sdkUrlNotAllowed'
    | 'unexpectedError';
  tags: never;
}
