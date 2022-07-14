import {
  ChallengeData,
  DeviceInfo,
  IdentifyType,
  OnboardingData,
  TenantInfo,
  UserDataAttribute,
} from 'src/utils/state-machine/types';

export enum States {
  init = 'Init',

  // Misc
  tenantInvalid = 'tenantInvalid',
  confirmAndAuthorize = 'confirmAndAuthorize',

  // Identify
  emailIdentification = 'emailIdentification',
  verificationSuccess = 'verificationSuccess',
  phoneRegistration = 'phoneRegistration',

  // Challenge
  qrLogin = 'qrLogin',
  biometricLoginRetry = 'biometricLoginRetry',
  phoneVerification = 'phoneVerification',
  livenessRegister = 'livenessRegister',
  livenessRegisterSucceeded = 'livenessRegisterSucceeded',

  // Onboarding
  onboardingVerification = 'onboardingVerification',
  onboarding = 'onboarding',
  onboardingSuccess = 'registrationSuccess',

  // Authentication
  authenticationSuccess = 'authenticationSuccess',
}

export enum Events {
  // Tenant
  tenantInfoRequestSucceeded = 'tenantInfoRequestSucceeded',
  tenantInfoRequestFailed = 'tenantInfoRequestFailed',

  onboardingVerificationSucceeded = 'onboardingVerificationSucceeded',

  // Identify
  emailChangeRequested = 'emailChangeRequested',
  userIdentifiedByEmail = 'userIdentifiedByEmail',
  userIdentifiedByPhone = 'userIdentifiedByPhone',
  userNotIdentified = 'userNotIdentified',
  navigatedToPrevPage = 'navigatedToPrevPage',
  sharedDataConfirmed = 'sharedDataConfirmed',

  // Authentication
  authenticationFlowStarted = 'authenticationFlowStarted',
  authenticationSucceeded = 'authenticationSucceeded',

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
  assignIdentifyType = 'assignIdentifyType',
  assignEmail = 'assignEmail',
  assignPhone = 'assignPhone',
  resetContext = 'resetContext',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignChallenge = 'assignChallengeData',
  assignDeviceInfo = 'assignDeviceInfo',
  assignTenantInfo = 'assignTenantInfo',

  // Onboarding
  assignMissingAttributes = 'assignMissingAttributes',
  assignMissingWebauthnCredentials = 'assignMissingWebAuthnCredentials',
}

export type BifrostContext = {
  authToken?: string;
  challenge?: ChallengeData;
  device: DeviceInfo;
  email: string;
  identifyType: IdentifyType;
  onboarding: OnboardingData;
  phone?: string;
  tenant: TenantInfo;
  userFound: boolean;
};

export type BifrostEvent =
  | { type: Events.authenticationFlowStarted }
  | {
      type: Events.tenantInfoRequestSucceeded;
      payload: {
        pk: string;
        name: string;
        mustCollectDataKinds: UserDataAttribute[];
        canAccessDataKinds: UserDataAttribute[];
      };
    }
  | {
      type: Events.tenantInfoRequestFailed;
    }
  | { type: Events.emailChangeRequested }
  | {
      type: Events.userIdentifiedByEmail;
      payload: {
        email: string;
        userFound: boolean;
        challengeData?: ChallengeData; // only if user found
      };
    }
  | { type: Events.navigatedToPrevPage }
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
      type: Events.onboardingVerificationSucceeded;
      payload: {
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
      payload: { challengeData: ChallengeData };
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
      };
    }
  | { type: Events.sharedDataConfirmed };
