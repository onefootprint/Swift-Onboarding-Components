import type { ChallengeData, EmailOrPhoneIdentifier, ObConfigAuth } from '../data';

export type SignupChallengeRequest = EmailOrPhoneIdentifier & {
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
  error?: string;
};
