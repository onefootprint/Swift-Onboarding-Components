import { DeviceInfo } from 'hooks';
import { IdentifyType } from 'src/utils/state-machine/types';

export enum States {
  emailIdentification = 'emailIdentification',
  phoneRegistration = 'phoneRegistration',
  phoneVerification = 'phoneVerification',
  biometricLoginRetry = 'biometricLoginRetry',
  success = 'success',
}

export enum ChallengeKind {
  sms = 'sms',
  biometric = 'biometric',
}

export type ChallengeData = {
  challengeToken: string;
  challengeKind: ChallengeKind;
  phoneNumberLastTwo?: string;
  phoneCountry?: string;
  biometricChallengeJson?: string;
  retryDisabledUntil?: Date;
};

export type MachineContext = {
  device: DeviceInfo;
  email?: string;
  userFound?: boolean;
  challengeData?: ChallengeData;
  phone?: string;
  authToken?: string;
  identifyType: IdentifyType;
};

export enum Events {
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
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  assignUserFound = 'assignUserFound',
  assignChallenge = 'assignChallengeData',
  assignAuthToken = 'assignAuthToken',
  resetContext = 'resetContext',
}

export type MachineEvents =
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
        email?: string; // if the user was identified with a different email
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
