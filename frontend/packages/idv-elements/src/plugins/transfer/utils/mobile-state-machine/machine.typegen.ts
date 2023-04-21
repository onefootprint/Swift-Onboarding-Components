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
    assignInitialContext: 'receivedContext';
    assignScopedAuthToken: 'scopedAuthTokenGenerated';
    assignTab: 'newTabOpened';
    clearScopedAuthToken: 'statusPollingErrored';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'deviceSupport'
    | 'failure'
    | 'init'
    | 'newTabProcessing'
    | 'newTabRequest'
    | 'skipLiveness'
    | 'success';
  tags: never;
}
