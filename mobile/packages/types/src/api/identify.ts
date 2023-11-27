import type { ChallengeKind, Identifier, ObConfigAuth } from '../data';

export const SANDBOX_ID_HEADER = 'X-Sandbox-id';
export const AUTH_HEADER = 'X-Fp-Authorization';

export type IdentifyRequest = {
  identifier: Identifier;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
};

export type IdentifyResponse = {
  userFound: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
  isUnverified: boolean;
};
