import type {
  ChallengeData,
  ChallengeKind,
  CollectKycDataRequirement,
  Identifier,
  ObConfigAuth,
  OnboardingRequirement,
  OverallOutcome,
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
  requirement?: CollectKycDataRequirement;
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
  startedDataCollection?: boolean;
  collectedKycData?: boolean;
  sandboxOutcome?: {
    overallOutcome: OverallOutcome;
    sandboxId: string;
  };
};

export type SdkArgsReceivedEvent = {
  type: 'sdkArgsReceived';
  payload: {
    config: PublicOnboardingConfig;
  };
};

export type RequirementsReceivedEvent = {
  type: 'requirementsReceived';
  payload: OnboardingRequirement[];
};

export type MachineEvents =
  | { type: 'failed' }
  | { type: 'done' }
  | SdkArgsReceivedEvent
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
    }
  | {
      type: 'dataConfirmed';
    }
  | {
      type: 'skipLiveness';
    }
  | {
      type: 'skipLivenessError';
    }
  | {
      type: 'requiresIdDoc';
    }
  | {
      type: 'sandboxOutcomeReceived';
      payload: {
        overallOutcome: OverallOutcome;
        sandboxId: string;
      };
    }
  | RequirementsReceivedEvent;
