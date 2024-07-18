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
    assignDocument: 'receivedDocument';
    assignErrors: 'processingErrored' | 'uploadErrored';
    assignHasBadConnectivity: 'processingErrored';
    assignId: 'contextInitialized';
    clearErrors: 'navigatedToPrompt' | 'receivedDocument' | 'startImageCapture';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'complete'
    | 'desktopProcessing'
    | 'documentPrompt'
    | 'failure'
    | 'imageCaptureMobile'
    | 'init'
    | 'mobileProcessing'
    | 'retryDesktop'
    | 'retryMobile';
  tags: never;
}
