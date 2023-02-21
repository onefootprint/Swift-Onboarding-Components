import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeData, ChallengeKind, Identifier } from '@onefootprint/types';

import { BootstrapData } from '../bifrost/types';

export enum States {
  // Legacy Bootstrap States
  legacyProcessBootstrapData = 'legacyProcessBootstrapData',

  // New Bootstrap States
  initBootstrap = 'initBootstrap',
  bootstrapChallenge = 'bootstrapChallenge',

  // Other Events
  processBootstrapData = 'processBootstrapData',
  sandboxOutcome = 'sandboxOutcome',
  emailIdentification = 'emailIdentification',
  phoneRegistration = 'phoneRegistration',
  phoneVerification = 'phoneVerification',
  biometricLoginRetry = 'biometricLoginRetry',
  success = 'success',
}

export type MachineContext = {
  tenantPk?: string;
  device: DeviceInfo;
  bootstrapData: BootstrapData;

  identify: {
    phoneNumber?: string;
    email?: string;
    userFound?: boolean;
    successfulIdentifier?: Identifier;
    identifierSuffix?: string;
  };

  challenge: {
    hasSyncablePassKey?: boolean;
    availableChallengeKinds?: ChallengeKind[];
    challengeData?: ChallengeData;
    authToken?: string;
  };
};

export enum Events {
  // Legacy Bootstrap Events
  legacyBootstrapDataProcessed = 'legacyBootstrapDataProcessed',
  legacyBootstrapDataProcessErrored = 'legacyBootstrapDataProcessErrored',

  // Other Events
  identified = 'identified',
  identifyFailed = 'identifyFailed',
  identifyReset = 'identifyReset',
  navigatedToPrevPage = 'navigatedToPrevPage',
  challengeInitiated = 'challengeInitiated',
  challengeSucceeded = 'challengeSucceeded',
  challengeFailed = 'challengeFailed',
}

export enum Actions {
  // Legacy Bootstrap Actions
  assignLegacyBootstrapData = 'assignLegacyBootstrapData',

  // Other Actions
  assignSandboxOutcome = 'assignSandboxOutcome',
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  assignAvailableChallengeKinds = 'assignAvailableChallengeKinds',
  assignSuccessfulIdentifier = 'assignSuccessfulIdentifier',
  assignHasSyncablePassKey = 'assignHasSyncablePassKey',
  assignUserFound = 'assignUserFound',
  assignChallengeData = 'assignChallengeData',
  assignAuthToken = 'assignAuthToken',
  reset = 'reset',
}

export type MachineEvents =
  | BootstrapEvents
  | IdentifyEvents
  | ChallengeEvents
  | OtherEvents;

type BootstrapEvents =
  // Legacy Bootstrap Events
  | {
      type: Events.legacyBootstrapDataProcessed;
      payload: {
        userFound: boolean;
        challengeData: ChallengeData;
      };
    }
  | {
      type: Events.legacyBootstrapDataProcessErrored;
    };

type IdentifyEvents =
  | {
      type: Events.identified;
      payload: {
        email?: string;
        phoneNumber?: string;
        userFound: boolean;
        availableChallengeKinds?: ChallengeKind[];
        hasSyncablePassKey?: boolean;
      };
    }
  | {
      type: Events.identifyFailed;
      payload: {
        email?: string;
        phoneNumber?: string;
      };
    }
  | { type: Events.identifyReset };

type ChallengeEvents =
  | {
      type: Events.challengeInitiated;
      payload: {
        challengeData: ChallengeData;
      };
    }
  | {
      type: Events.challengeSucceeded;
      payload: {
        authToken: string;
      };
    }
  | { type: Events.challengeFailed };

type OtherEvents = { type: Events.navigatedToPrevPage };
