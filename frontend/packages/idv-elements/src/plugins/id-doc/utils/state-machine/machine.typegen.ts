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
    assignId: 'receivedCountryAndType';
    assignIdDocImageErrors: 'processingErrored' | 'uploadErrored';
    assignImage: 'receivedImage';
    clearImageAndErrors: 'navigatedToCountryDoc';
    resetSide: 'receivedCountryAndType';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'backImageCaptureMobile'
    | 'backImageDesktop'
    | 'backImageMobile'
    | 'backImageRetryDesktop'
    | 'backImageRetryMobile'
    | 'complete'
    | 'consentDesktop'
    | 'countryAndType'
    | 'failure'
    | 'frontImageCaptureMobile'
    | 'frontImageDesktop'
    | 'frontImageMobile'
    | 'frontImageRetryDesktop'
    | 'frontImageRetryMobile'
    | 'init'
    | 'processingDesktop'
    | 'processingMobile'
    | 'selfieImageDesktop'
    | 'selfieImageMobile'
    | 'selfieImageRetryDesktop'
    | 'selfieImageRetryMobile'
    | 'selfiePromptMobile';
  tags: never;
}
