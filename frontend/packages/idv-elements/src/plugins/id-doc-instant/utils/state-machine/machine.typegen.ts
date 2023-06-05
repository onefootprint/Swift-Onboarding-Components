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
    assignConsent: 'consentReceived';
    assignCountryAndType: 'receivedCountryAndType';
    assignIdDocImageErrors: 'processingErrored';
    assignImage: 'receivedImage';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'backImage'
    | 'backImageRetry'
    | 'complete'
    | 'countryAndType'
    | 'failure'
    | 'frontImage'
    | 'frontImageRetry'
    | 'processing'
    | 'selfieImage'
    | 'selfieImageRetry'
    | 'selfiePrompt';
  tags: never;
}
