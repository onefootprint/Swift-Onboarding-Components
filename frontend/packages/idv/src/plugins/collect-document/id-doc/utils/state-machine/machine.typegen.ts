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
    assignCameraPermissionState: 'cameraAccessDenied' | 'cameraAccessGranted';
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
    | 'mobileCameraAccessDenied'
    | 'mobileFrontImageCapture'
    | 'mobileFrontImageRetry'
    | 'mobileFrontPhotoFallback'
    | 'mobileProcessing'
    | 'mobileRequestCameraAccess'
    | 'mobileSelfieFallback'
    | 'mobileSelfieImage'
    | 'mobileSelfieImageRetry';
  tags: never;
}
