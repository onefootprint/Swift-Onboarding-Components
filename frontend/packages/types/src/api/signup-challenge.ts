import { ChallengeData, ObConfigAuth } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
  obConfigAuth: ObConfigAuth;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
