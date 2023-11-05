export enum Events {
  // Funnel
  FStarted = 'Started',
  FPasskeyCompleted = 'Passkeys completed',
  FIdDocCompleted = 'Id doc completed',
  FEnded = 'Ended',

  // Passkeys
  PasskeysRegistrationStarted = 'Passkeys registration started',
  PasskeysRegistrationRetried = 'Passkeys registration retried',
  PasskeyRegistrationSucceeded = 'Passkeys registration succeeded',
  PasskeyRegistrationFailed = 'Passkeys registration failed',
  PasskeyRegistrationRetriedFailed = 'Passkeys registration retried failed',
  PasskeyRegistrationSkipped = 'Passkeys registration skipped',
  PasskeyRegistrationNotSupported = 'Passkeys registration not supported',

  // Documents
  DocSelectionSubmitted = 'Doc type and country submitted',
  DocSelectionSubmittedFailed = 'Doc type and country submitted failed',
  DocSelectionSubmittedSucceeded = 'Doc type and country submitted succeeded',

  // Camera permissions
  DocCameraPermissionsOpened = 'Doc Camera permission opened',
  DocCameraPermissionsClosed = 'Doc Camera permission closed',
  DocCameraPermissionsGranted = 'Doc Camera permission granted',
  DocCameraPermissionsDenied = 'Doc Camera permission denied',
  DocCameraSettingsOpened = 'Doc Camera settings opened',

  // Consent
  DocConsentAccepted = 'Doc Consent accepted',

  // Upload
  DocUploaded = 'Doc uploaded',
  DocUploadFailed = 'Doc upload failed',
  DocUploadSucceeded = 'Doc upload succeeded',
  DocUploadRestarted = 'Doc upload restarted',
}

export enum AnalyticsTimeEvents {
  handoff = 'Handoff Flow',
}
