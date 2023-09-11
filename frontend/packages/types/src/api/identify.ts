import type { ChallengeKind, Identifier, ObConfigAuth } from '../data';

export const SANDBOX_ID_HEADER = 'X-Sandbox-id';

export type IdentifyRequest = {
  identifier: Identifier;
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

export type IdentifyResponse = {
  userFound: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
};
