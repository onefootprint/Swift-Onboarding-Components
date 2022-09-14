import { IdentifyType } from '../data';

export type IdentifyChallengeRequest = {
  phoneNumber: string;
  identifyType: IdentifyType;
};

export type IdentifyChallengeResponse = {
  challengeToken: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
