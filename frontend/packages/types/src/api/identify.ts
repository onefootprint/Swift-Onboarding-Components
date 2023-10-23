import type { ChallengeKind, Identifier, ObConfigAuth } from '../data';

export const SANDBOX_ID_HEADER = 'X-Sandbox-id';
export const AUTH_HEADER = 'X-Fp-Authorization';

export type IdentifyRequest = {
  // We can identify users by email/phone or auth token
  identifier: Identifier;
  // Must be provided when identifier is anything other than an authToken
  obConfigAuth?: ObConfigAuth;
  // Sandbox IDs uniquely distinguish different users even though same email/phone
  sandboxId?: string;
};

export type IdentifyResponse = {
  // Whether there is a footprint user vault
  userFound: boolean;
  // Whether the user has verified credentials, likely indicating whether vault was created by API
  // Will be true if challenge kinds is empty, user vault is not portable and the user has phone number stored
  isUnverified: boolean;
  // Whether the passkeys were registered with device on a up-to-date version
  // that can sync passkeys across devices
  hasSyncablePassKey?: boolean;
  // Email included only if no-phone user, otherwise phone is included by default.
  // Passkey included only if registered by user
  availableChallengeKinds?: ChallengeKind[];
};

/*
  Example responses
  
    First time user: 
      userFound = false, 
      isUnverified = false, 
      availableChallengeKinds: [], 
      hasSyncablePassKey = false
    
    Returning user (with passkeys registered on up-to-date iOS): 
      userFound = true, 
      isUnverified = false, 
      availableChallengeKinds: ['sms', 'biometric'], 
      hasSyncablePassKey = true

    API only user: 
      userFound = true, 
      isUnverified = true,  
      availableChallengeKinds: [], 
      hasSyncablePassKey = false
*/
