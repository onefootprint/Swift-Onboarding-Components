import type { ChallengeData, ChallengeKind, Identifier, ObConfigAuth } from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
  obConfigAuth: ObConfigAuth;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};
