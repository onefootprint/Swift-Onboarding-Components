export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  authToken: string;
  scope: IdentifyTokenScope;
};

export enum IdentifyTokenScope {
  auth = 'auth',
  onboarding = 'onboarding',
}

export type IdentifyVerifyResponse = {
  authToken: string;
};
