import { ChallengeData, ChallengeKind, Identifier } from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
  tenantPk?: string;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};
