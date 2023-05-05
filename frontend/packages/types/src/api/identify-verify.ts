import IdentifyUserKind from '../data/identify-user-kind';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  tenantPk?: string; // When set, creates an onboarding token linked to the tenant
  customAuthHeader?: Record<string, string>; // Custom headers to be sent to the backend
};

export type IdentifyVerifyResponse = {
  kind: IdentifyUserKind;
  authToken: string;
};
