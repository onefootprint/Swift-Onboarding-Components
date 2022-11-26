import {
  ChallengeData,
  ChallengeKind,
  Identifier,
  IdentifyType,
} from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
  identifyType: IdentifyType;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};
