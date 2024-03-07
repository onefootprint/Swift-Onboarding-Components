import type { ChallengeData, ChallengeKind } from '../data';

export type LoginChallengeRequest = {
  preferredChallengeKind: ChallengeKind;
  isResend?: boolean;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
  error?: string;
};
