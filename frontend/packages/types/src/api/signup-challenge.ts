import { IdentifyType } from '../data';

export type SignupChallengeRequest = {
  phoneNumber: string;
  identifyType: IdentifyType;
};

export type SignupChallengeResponse = {
  challengeToken: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
