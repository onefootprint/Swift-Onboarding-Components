import type { ObConfigAuth } from '../data';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  obConfigAuth?: ObConfigAuth;
};

export type IdentifyVerifyResponse = {
  authToken: string;
};
