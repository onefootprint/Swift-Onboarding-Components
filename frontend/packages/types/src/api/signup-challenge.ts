import { ChallengeData, IdentifyType } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
  identifyType: IdentifyType;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
