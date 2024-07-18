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
    assignSide: 'receivedCountryAndType';
    clearImageAndErrors: 'navigatedToCountryDoc';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'complete'
    | 'countryAndType'
    | 'desktopBackImage'
    | 'desktopBackImageRetry'
    | 'desktopConsent'
    | 'desktopFrontImage'
    | 'desktopFrontImageRetry'
    | 'desktopProcessing'
    | 'desktopSelfieFallback'
    | 'desktopSelfieImage'
    | 'desktopSelfieImageRetry'
    | 'failure'
    | 'mobileBackImageCapture'
    | 'mobileBackImageRetry'
    | 'mobileBackPhotoFallback'
    | 'mobileFrontImageCapture'
    | 'mobileFrontImageRetry'
    | 'mobileFrontPhotoFallback'
    | 'mobileProcessing'
    | 'mobileSelfieFallback'
    | 'mobileSelfieImage'
    | 'mobileSelfieImageRetry';
  tags: never;
}
