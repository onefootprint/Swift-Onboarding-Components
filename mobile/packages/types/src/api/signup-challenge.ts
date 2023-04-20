import { ChallengeData } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
  tenantPk?: string;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
