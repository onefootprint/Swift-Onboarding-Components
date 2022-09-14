import ChallengeKind from './challenge-kind';

export type ChallengeData = {
  challengeToken: string;
  challengeKind: ChallengeKind;
  phoneNumberLastTwo?: string;
  phoneCountry?: string;
  biometricChallengeJson?: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
