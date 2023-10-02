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
    assignScopedAuthToken: 'scopedAuthTokenGenerated';
    clearScopedAuthToken: 'd2pSessionCanceled' | 'd2pSessionExpired';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'complete'
    | 'confirmContinueOnDesktop'
    | 'init'
    | 'processing'
    | 'qrRegister';
  tags: never;
}
