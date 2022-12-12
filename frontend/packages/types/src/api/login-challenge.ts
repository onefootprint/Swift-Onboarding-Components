import { ChallengeData, ChallengeKind, Identifier } from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};
