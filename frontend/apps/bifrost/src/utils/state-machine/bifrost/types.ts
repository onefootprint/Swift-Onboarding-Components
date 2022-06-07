import {
  ChallengeData,
  DeviceInfo,
  OnboardingData,
  UserDataAttribute,
} from 'src/utils/state-machine/types';

export enum States {
  // Identify
  emailIdentification = 'emailIdentification',
  verificationSuccess = 'verificationSuccess',
  phoneRegistration = 'phoneRegistration', // Email not associated with an existing user, asking for phone

  // Challenge
  qrLogin = 'qrLogin',
  biometricLoginRetry = 'biometricLoginRetry',
  phoneVerification = 'phoneVerification', // Existing user phone gets pin code
  livenessRegister = 'livenessRegister',
  livenessRegisterSucceeded = 'livenessRegisterSucceeded',

  // Onboarding
  onboarding = 'onboarding',
  onboardingSuccess = 'registrationSuccess',
}

export enum Events {
  // Identify
  emailChangeRequested = 'emailChangeRequested',
  userIdentifiedByEmail = 'userIdentifiedByEmail',
  userIdentifiedByPhone = 'userIdentifiedByPhone',
  userNotIdentified = 'userNotIdentified',

  // Liveness Challenge
  smsChallengeInitiated = 'smsChallengeInitiated',
  smsChallengeResent = 'smsChallengeResent',
  smsChallengeSucceeded = 'smsChallengeSucceeded',
  deviceInfoIdentified = 'deviceInfoIdentified',
  biometricLoginSucceeded = 'biometricLoginSucceeded',
  biometricLoginFailed = 'livenessLoginFailed',
}

export enum Actions {
  // Identify & Challenge
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  resetContext = 'resetContext',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignChallenge = 'assignChallengeData',
  assignDeviceInfo = 'assignDeviceInfo',

  // Onboarding
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebAuthnCredentials',
}

export type BifrostContext = {
  email: string;
  phone?: string;
  userFound: boolean;
  authToken?: string;
  device: DeviceInfo;
  challenge?: ChallengeData;
  onboarding: OnboardingData;
};

export type BifrostEvent =
  | { type: Events.emailChangeRequested }
  | {
      type: Events.userIdentifiedByEmail;
      payload: {
        email: string;
        userFound: boolean;
        challengeData?: ChallengeData; // only if user found
      };
    }
  | {
      type: Events.biometricLoginSucceeded;
      payload: {
        email: string;
        userFound: boolean;
        authToken: string;
        missingAttributes: readonly UserDataAttribute[];
        missingWebauthnCredentials: boolean;
      };
    }
  | {
      type: Events.biometricLoginFailed;
      payload: {
        email: string;
        userFound: boolean;
      };
    }
  | {
      type: Events.smsChallengeInitiated;
      payload: {
        challengeData: ChallengeData;
      };
    }
  | {
      type: Events.userIdentifiedByPhone;
      payload: {
        phone: string;
        userFound: boolean;
        challengeData?: ChallengeData; // only if user found
      };
    }
  | {
      type: Events.userNotIdentified;
      payload: {
        email?: string;
        phone?: string;
        userFound: boolean;
      };
    }
  | {
      type: Events.smsChallengeResent;
      payload: { challenge: ChallengeData };
    }
  | {
      type: Events.deviceInfoIdentified;
      payload: {
        hasSupportForWebAuthn: boolean;
        type: string;
      };
    }
  | {
      type: Events.smsChallengeSucceeded;
      payload: {
        authToken: string;
        missingAttributes: readonly UserDataAttribute[];
        missingWebauthnCredentials: boolean;
      };
    };
