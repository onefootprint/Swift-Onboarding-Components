import { ChallengeKind, Identifier } from '../data';

export type IdentifyRequest = {
  identifier: Identifier;
  tenantPk?: string;
};

export type IdentifyResponse = {
  userFound: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
};
