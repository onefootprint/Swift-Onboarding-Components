export enum AnalyticsEvents {
  // Funnel
  Started = 'Started',
  PasskeyCompleted = 'Passkeys completed',
  IdDocCompleted = 'Id doc completed',
  Ended = 'Ended',

  // Passkeys
  PasskeysRegistrationStarted = 'Passkeys registration started',
  PasskeysRegistrationRetried = 'Passkeys registration retried',
  PasskeyRegistrationSucceeded = 'Passkeys registration succeeded',
  PasskeyRegistrationFailed = 'Passkeys registration failed',

  // Documents
  DocCountrySelectOpened = 'Doc country select opened',
  DocCountrySelectChange = 'Doc country select changed',
  DocCountrySelectClosed = 'Doc country select closed',

  DocCountrySubmitted = 'Doc country submitted',
  DocCameraPermissionsClosed = 'Doc Camera permission closed',
  DocCameraPermissionsContinued = 'Doc Camera permission continued',
  DocCameraSettingsOpened = 'Doc Camera settings opened',

  DocConsentAccepted = 'Doc Consent accepted',

  DocFrontPageSubmitted = 'Doc front submitted',
  DocFrontFailed = 'Doc front failed',
  DocFrontRestarted = 'Doc front restarted',
  DocFrontSucceeded = 'Doc front succeeded',

  DocBackPageSubmitted = 'Doc back submitted',
  DocBackFailed = 'Doc back failed',
  DocBackRestarted = 'Doc back restarted',
  DocBackSucceeded = 'Doc back succeeded',

  DocSelfiePageSubmitted = 'Doc selfie submitted',
  DocSelfieFailed = 'Doc selfie failed',
  DocSelfieRestarted = 'Doc selfie restarted',
  DocSelfieSucceeded = 'Doc selfie succeeded',
}

export enum AnalyticsTimeEvents {
  handoff = 'Handoff Flow',
}
