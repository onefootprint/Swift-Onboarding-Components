import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeData, ChallengeKind, Identifier } from '@onefootprint/types';

import { BootstrapData } from '../bifrost/types';

export enum States {
  processBootstrapData = 'processBootstrapData',
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
  bootstrapDataProcessed = 'bootstrapDataProcessed',
  bootstrapDataProcessErrored = 'bootstrapDataProcessErrored',
  identifyCompleted = 'identifyCompleted',
  navigatedToPrevPage = 'navigatedToPrevPage',
  emailChangeRequested = 'emailChangeRequested',
  smsChallengeInitiated = 'smsChallengeInitiated',
  smsChallengeSucceeded = 'smsChallengeSucceeded',
  biometricLoginSucceeded = 'biometricLoginSucceeded',
  biometricLoginFailed = 'livenessLoginFailed',
}

export enum Actions {
  assignBootstrapData = 'assignBootstrapData',
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  assignUserFound = 'assignUserFound',
  assignChallenge = 'assignChallengeData',
  assignAuthToken = 'assignAuthToken',
  resetContext = 'resetContext',
}

export type MachineEvents =
  | {
      type: Events.bootstrapDataProcessed;
      payload: {
        userFound: boolean;
        challengeData: ChallengeData;
      };
    }
  | {
      type: Events.bootstrapDataProcessErrored;
    }
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
