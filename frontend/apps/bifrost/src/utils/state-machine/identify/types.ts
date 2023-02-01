import { DeviceInfo } from '@onefootprint/hooks';
import { ChallengeData } from '@onefootprint/types';

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
  emailIdentificationCompleted = 'emailIdentificationCompleted',
  phoneIdentificationCompleted = 'phoneIdentificationCompleted',
  navigatedToPrevPage = 'navigatedToPrevPage',
  emailChangeRequested = 'emailChangeRequested',
  smsChallengeInitiated = 'smsChallengeInitiated',
  smsChallengeResent = 'smsChallengeResent',
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
      type: Events.emailIdentificationCompleted;
      payload: {
        email: string;
        userFound: boolean;
        challengeData?: ChallengeData; // if user was found
      };
    }
  | {
      type: Events.phoneIdentificationCompleted;
      payload: {
        userFound: boolean;
        phone: string;
        challengeData?: ChallengeData; // if user was found
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
      type: Events.smsChallengeResent;
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
