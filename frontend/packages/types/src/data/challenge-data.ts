import type ChallengeKind from './challenge-kind';

export type ChallengeData = {
  token: string;
  challengeToken: string;
  challengeKind: ChallengeKind;
  biometricChallengeJson?: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
