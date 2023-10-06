export enum AnalyticsEvents {
  // Funnel
  Started = 'Started',
  PasskeyCompleted = 'Passkeys completed',
  IdDocCompleted = 'Id doc completed',
  Ended = 'Ended',

  // Passkeys
  PasskeyRegistrationError = 'Passkeys registration failed',
}

export enum AnalyticsTimeEvents {
  handoff = 'Handoff Flow',
}
