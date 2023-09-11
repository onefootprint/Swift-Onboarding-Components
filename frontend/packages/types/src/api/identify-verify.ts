import type { ObConfigAuth } from '../data';
import type IdentifyUserKind from '../data/identify-user-kind';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

export type IdentifyVerifyResponse = {
  kind: IdentifyUserKind;
  authToken: string;
};
