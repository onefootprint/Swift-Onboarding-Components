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
    assignTab: 'newTabOpened';
    clearScopedAuthToken: 'd2pSessionCanceled' | 'd2pSessionExpired';
    clearTab: 'tabClosed';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'complete'
    | 'confirmContinueOnDesktop'
    | 'init'
    | 'newTabProcessing'
    | 'newTabRequest'
    | 'nonSocialMediaBrowser'
    | 'qrProcessing'
    | 'qrRegister'
    | 'sms'
    | 'smsProcessing'
    | 'socialMediaBrowser';
  tags: never;
}
