import type { AuthMethodKind, ChallengeKind, DataIdentifier, ObConfigAuth } from '../data';
import type { UserTokenScope } from './user-token';

export const IS_COMPONENTS_SDK_HEADER = 'X-Fp-Is-Components-Sdk';
export const SANDBOX_ID_HEADER = 'X-Sandbox-id';
export const AUTH_HEADER = 'X-Fp-Authorization';

export type IdentifyRequest = {
  // We can identify users by email/phone or auth token
  phoneNumber?: string;
  email?: string;
  authToken?: string;
  // Must be provided when identifier is anything other than an authToken
  obConfigAuth?: ObConfigAuth;
  // Sandbox IDs uniquely distinguish different users even though same email/phone
  sandboxId?: string;
  scope: string; // Allowed values: my1fp, onboarding, auth
};

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

/*
  Example responses
  
    First time user: 
      userFound = false, 
      user = null,
    
    Returning user (with passkeys registered on up-to-date iOS): 
      userFound = true, 
      user = {
        token = 'utok_xxx',
        isUnverified = false, 
        authMethods: [{kind: 'phone', isVerified: true}, {kind: 'passkey', isVerified: true}], 
        hasSyncablePassKey = true
      }

    API only user: 
      userFound = true, 
      user = {
        token = 'utok_xxx',
        isUnverified = true, 
        authMethods: [{kind: 'phone', isVerified: false}],
        hasSyncablePassKey = true
      }
*/
