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
    assignContext: 'receivedContext';
    assignScopedAuthToken: 'scopedAuthTokenGenerated';
    clearScopedAuthToken: 'qrCodeCanceled' | 'statusPollingErrored';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'deviceSupport'
    | 'failure'
    | 'init'
    | 'qrCodeScanned'
    | 'qrCodeSent'
    | 'qrRegister'
    | 'success';
  tags: never;
}
