import type ChallengeKind from './challenge-kind';

export type ChallengeData = {
  challengeToken: string;
  challengeKind: ChallengeKind;
  scrubbedPhoneNumber?: string;
  biometricChallengeJson?: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
