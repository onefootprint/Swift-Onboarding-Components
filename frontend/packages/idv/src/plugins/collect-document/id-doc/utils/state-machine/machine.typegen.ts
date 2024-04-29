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
    assignForcedUpload: 'cameraStuck';
    assignHasBadConnectivity: 'processingErrored';
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
    | 'backImageRetryDesktop'
    | 'backImageRetryMobile'
    | 'complete'
    | 'consentDesktop'
    | 'countryAndType'
    | 'desktopSelfieFallback'
    | 'failure'
    | 'frontImageCaptureMobile'
    | 'frontImageDesktop'
    | 'frontImageRetryDesktop'
    | 'frontImageRetryMobile'
    | 'mobileBackPhotoFallback'
    | 'mobileFrontPhotoFallback'
    | 'mobileSelfieFallback'
    | 'processingDesktop'
    | 'processingMobile'
    | 'selfieImageDesktop'
    | 'selfieImageMobile'
    | 'selfieImageRetryDesktop'
    | 'selfieImageRetryMobile';
  tags: never;
}
