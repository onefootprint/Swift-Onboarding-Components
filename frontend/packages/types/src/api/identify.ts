import { ChallengeKind, Identifier } from '../data';

export type IdentifyRequest = {
  identifier: Identifier;
  tenantPk?: string;
  customAuthHeader?: Record<string, string>;
};

export type IdentifyResponse = {
  userFound: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
};
