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
    assignDevice: 'deviceReceived';
    assignPasskeyRegistrationWindow: 'passkeyRegistrationTabOpened';
    assignProps: 'authPropsReceived';
    assignScopedAuthToken: 'scopedAuthTokenReceived';
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
    | 'passkeyCancelled'
    | 'passkeyError'
    | 'passkeyOptionalRegistration'
    | 'passkeyProcessing'
    | 'passkeySuccess'
    | 'sdkUrlNotAllowed';
  tags: never;
}
