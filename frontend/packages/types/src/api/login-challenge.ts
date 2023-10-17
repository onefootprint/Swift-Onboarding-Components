import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  ObConfigAuth,
} from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
  // Must be provided when identifier is anything other than an authToken
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  isResend?: boolean;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
  error?: string;
};
