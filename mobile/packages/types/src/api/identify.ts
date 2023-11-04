import type { ChallengeKind, Identifier, ObConfigAuth } from '../data';

export type IdentifyRequest = {
  identifier: Identifier;
  obConfigAuth?: ObConfigAuth;
};

export type IdentifyResponse = {
  userFound: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
};
