import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig, OnboardingStatus } from '@onefootprint/types';

export enum States {
  init = 'Init',
  identify = 'identify',
  configInvalid = 'configInvalid',
  authenticationSuccess = 'authenticationSuccess',
  onboarding = 'onboarding',
  complete = 'complete',
}

export enum Events {
  initContextUpdated = 'initContextUpdated',
  configRequestFailed = 'configRequestFailed',
  authenticationSucceeded = 'authenticationSucceeded',
  identifyCompleted = 'done.invoke.identify',
  onboardingCompleted = 'done.invoke.onboarding',
  reset = 'reset',
}

export enum Actions {
  assignInitContext = 'assignInitContext',
  assignUserFound = 'assignUserFound',
  assignAuthToken = 'assignAuthToken',
  assignEmail = 'assignEmail',
  assignValidationToken = 'assignValidationToken',
  assignStatus = 'assignStatus',
  resetContext = 'resetContext',
}

export type BootstrapData = {
  email?: string;
  phoneNumber?: string;
};

export type BifrostContext = {
  authToken?: string;
  device?: DeviceInfo;
  config?: OnboardingConfig;
  userFound?: boolean;
  email?: string;
  validationToken?: string;
  bootstrapData?: BootstrapData;
  status?: OnboardingStatus;
};

export type BifrostEvent =
  | {
      type: Events.initContextUpdated;
      payload: {
        config?: OnboardingConfig;
        device?: DeviceInfo;
        bootstrapData?: BootstrapData;
      };
    }
  | {
      type: Events.configRequestFailed;
    }
  | {
      type: Events.identifyCompleted;
      data: {
        authToken: string;
        userFound: boolean;
        email?: string;
      };
    }
  | {
      type: Events.onboardingCompleted;
      data: {
        validationToken?: string;
        status?: OnboardingStatus;
      };
    }
  | {
      type: Events.reset;
    };
