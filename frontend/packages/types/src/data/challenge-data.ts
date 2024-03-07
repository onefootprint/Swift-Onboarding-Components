import type ChallengeKind from './challenge-kind';

export type ChallengeData = {
  token: string;
  challengeToken: string;
  challengeKind: ChallengeKind;
  scrubbedPhoneNumber?: string;
  biometricChallengeJson?: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
