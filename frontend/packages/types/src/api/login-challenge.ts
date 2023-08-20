import {
  ChallengeData,
  ChallengeKind,
  Identifier,
  ObConfigAuth,
} from '../data';

export type LoginChallengeRequest = {
  identifier: Identifier;
  preferredChallengeKind: ChallengeKind;
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
  isResend?: boolean;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};
