import type { ChallengeData, ObConfigAuth } from '../data';

export type SignupChallengeRequest = {
  email?: string;
  phoneNumber?: string;
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
  error?: string;
};
