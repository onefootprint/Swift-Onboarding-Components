import { ChallengeData, ChallengeKind, Identifier } from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
  tenantPk?: string;
  customAuthHeader?: Record<string, string>;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};
