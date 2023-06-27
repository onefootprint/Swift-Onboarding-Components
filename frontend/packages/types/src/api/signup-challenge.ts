import { ChallengeData, ObConfigAuth } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
