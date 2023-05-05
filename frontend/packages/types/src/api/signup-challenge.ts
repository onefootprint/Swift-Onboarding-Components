import { ChallengeData } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
  tenantPk?: string;
  customAuthHeader?: Record<string, string>;
};

export type SignupChallengeResponse = {
  challengeData: ChallengeData;
};
