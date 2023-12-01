import type {
  ChallengeData,
  ChallengeKind,
  Identifier,
  ObConfigAuth,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type IdentifyResultProps = {
  email?: string;
  phoneNumber?: string;
  userFound: boolean;
  isUnverified: boolean;
  availableChallengeKinds?: ChallengeKind[];
  hasSyncablePassKey?: boolean;
  successfulIdentifier: Identifier;
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
    };
