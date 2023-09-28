import type { Identifier, ObConfigAuth } from '../data';
import type IdentifyUserKind from '../data/identify-user-kind';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  // We discard the identifier if it's anything but an authToken, but this is useful to have
  // typescript enforce that we always pass in an identifier
  identifier: Identifier;
};

export type IdentifyVerifyResponse = {
  kind: IdentifyUserKind;
  authToken: string;
};
