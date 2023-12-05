import type {
  ChallengeData,
  ChallengeKind,
  CollectKycDataRequirement,
  Identifier,
  ObConfigAuth,
  PublicOnboardingConfig,
} from '@onefootprint/types';

import type { KycData } from '@/types';

export type IdentifyResultProps = {
  email?: string;
  phoneNumber?: string;
  userFound: boolean;
  isUnverified: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
  successfulIdentifier: Identifier;
};

export type KycDataCollectionProps = {
  requirement: CollectKycDataRequirement;
  kycData?: KycData;
};

export type IdentifyData = {
  identifyResult?: IdentifyResultProps;
  challengeData?: ChallengeData;
  authToken?: string;
};

export type MachineContext = {
  sdkAuthToken: string;
  config?: PublicOnboardingConfig;
  obConfigAuth?: ObConfigAuth;
  identify: IdentifyData;
  kyc: KycDataCollectionProps;
};

export type MachineEvents =
  | { type: 'failed' }
  | { type: 'done' }
  | {
      type: 'sdkArgsReceived';
      payload: {
        config: PublicOnboardingConfig;
      };
    }
  | {
      type: 'identified';
      payload: IdentifyResultProps;
    }
  | { type: 'identifyReset' }
  | {
      type: 'phoneIdentification';
      payload: IdentifyResultProps;
    }
  | {
      type: 'challengeReceived';
      payload: ChallengeData;
    }
  | {
      type: 'challengeSucceeded';
      payload: {
        authToken: string;
      };
    }
  | {
      type: 'dataSubmitted';
      payload: KycData;
    };
