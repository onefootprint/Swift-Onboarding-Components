import { ChallengeData } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
