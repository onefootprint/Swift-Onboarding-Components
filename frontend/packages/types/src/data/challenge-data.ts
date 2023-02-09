import ChallengeKind from './challenge-kind';

export type ChallengeData = {
  challengeToken: string;
  challengeKind: ChallengeKind;
  phoneNumberLastTwo?: string;
  phoneCountryCode?: string;
  biometricChallengeJson?: string;
  retryDisabledUntil?: Date;
  timeBeforeRetryS?: number;
};
