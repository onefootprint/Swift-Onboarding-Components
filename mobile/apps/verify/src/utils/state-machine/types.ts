import type {
  ChallengeKind,
  ObConfigAuth,
  PublicOnboardingConfig,
} from '@onefootprint/types';

export type IdentifyResultProps = {
  email?: string;
  phoneNumber?: string;
  userFound: boolean;
  isUnverified: boolean;
  availableChallengeKinds: ChallengeKind[];
  hasSyncablePassKey: boolean;
};

export type MachineContext = {
  authToken: string;
  config?: PublicOnboardingConfig;
  obConfigAuth?: ObConfigAuth;
  identify?: IdentifyResultProps;
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
  | { type: 'identifyReset' };
