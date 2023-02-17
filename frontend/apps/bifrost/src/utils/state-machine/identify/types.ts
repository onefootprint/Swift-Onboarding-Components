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
  emailIdentification = 'emailIdentification',
  phoneRegistration = 'phoneRegistration',
  phoneVerification = 'phoneVerification',
  biometricLoginRetry = 'biometricLoginRetry',
  success = 'success',
}

export type MachineContext = {
  device: DeviceInfo;
  email?: string;
  userFound?: boolean;
  challengeData?: ChallengeData;
  phone?: string;
  authToken?: string;
  bootstrapData: BootstrapData;
  tenantPk?: string;
};

export enum Events {
  // Legacy Bootstrap Events
  legacyBootstrapDataProcessed = 'legacyBootstrapDataProcessed',
  legacyBootstrapDataProcessErrored = 'legacyBootstrapDataProcessErrored',

  // New Bootstrap Events
  loginWithDifferentAccount = 'loginWithDifferentAccount',
  loginChallengeSucceeded = 'loginChallengeSucceeded',
  bootstrapIdentifyFailed = 'bootstrapIdentifyFailed',

  // Other Events
  identifyCompleted = 'identifyCompleted',
  navigatedToPrevPage = 'navigatedToPrevPage',
  emailChangeRequested = 'emailChangeRequested',
  smsChallengeInitiated = 'smsChallengeInitiated',
  smsChallengeSucceeded = 'smsChallengeSucceeded',
  biometricLoginSucceeded = 'biometricLoginSucceeded',
  biometricLoginFailed = 'livenessLoginFailed',
}

export enum Actions {
  // Legacy Bootstrap Actions
  assignLegacyBootstrapData = 'assignLegacyBootstrapData',

  // New Bootstrap Actions
  assignBootstrapData = 'assignBootstrapData',

  // Other Actions
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  assignUserFound = 'assignUserFound',
  assignChallenge = 'assignChallengeData',
  assignAuthToken = 'assignAuthToken',
  resetContext = 'resetContext',
}

export type MachineEvents =
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
    }

  // New Bootstrap Events
  | {
      type: Events.loginWithDifferentAccount;
    }
  | {
      type: Events.loginChallengeSucceeded;
    }
  | {
      type: Events.bootstrapIdentifyFailed;
      payload: {
        email?: string;
        phoneNumber?: string;
      };
    }

  // Other Events
  | {
      type: Events.identifyCompleted;
      payload: {
        identifier: Identifier;
        userFound: boolean;
        availableChallengeKinds?: ChallengeKind[];
      };
    }
  | { type: Events.navigatedToPrevPage }
  | { type: Events.emailChangeRequested }
  | {
      type: Events.smsChallengeInitiated;
      payload: {
        challengeData: ChallengeData;
      };
    }
  | {
      type: Events.smsChallengeSucceeded;
      payload: {
        authToken: string;
      };
    }
  | {
      type: Events.biometricLoginSucceeded;
      payload: {
        authToken: string;
      };
    }
  | { type: Events.biometricLoginFailed };
