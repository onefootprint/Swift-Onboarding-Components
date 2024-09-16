import type { ChallengeKind, DataIdentifier, ObConfigAuth } from '../data';
import type { UserTokenScope } from './user-token';

export const SANDBOX_ID_HEADER = 'X-Sandbox-id';
export const AUTH_HEADER = 'X-Fp-Authorization';

export type IdentifyRequest = {
  email?: string;
  phoneNumber?: string;
  authToken?: string;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
};

enum AuthMethodKind {
  phone = 'phone',
  email = 'email',
  passkey = 'passkey',
}

export type IdentifiedAuthMethod = {
  kind: AuthMethodKind;
  isVerified: boolean;
};

export type IdentifiedUser = {
  token: string;
  tokenScopes: UserTokenScope[];
  authMethods: IdentifiedAuthMethod[];
  /// Should deprecate this soon in favor of authMethods
  availableChallengeKinds: ChallengeKind[];
  // Whether the passkeys were registered with device on a up-to-date version
  // that can sync passkeys across devices
  hasSyncablePasskey: boolean;
  // Whether the user has verified credentials, likely indicating whether vault was created by API
  // Will be true if challenge kinds is empty, user vault is not portable and the user has phone number stored
  isUnverified: boolean;
  scrubbedEmail?: string;
  scrubbedPhone?: string;
  matchingFps: DataIdentifier[];
};

export type IdentifyResponse = {
  /// Populated when the user is found
  user?: IdentifiedUser;
};
