import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig, OnboardingStatus } from '@onefootprint/types';

export enum States {
  init = 'Init',
  sandboxOutcome = 'sandboxOutcome',
  identify = 'identify',
  configInvalid = 'configInvalid',
  authenticationSuccess = 'authenticationSuccess',
  onboarding = 'onboarding',
  complete = 'complete',
}

export enum Events {
  initContextUpdated = 'initContextUpdated',
  configRequestFailed = 'configRequestFailed',
  sandboxOutcomeSubmitted = 'sandboxOutcomeSubmitted',
  authenticationSucceeded = 'authenticationSucceeded',
  identifyCompleted = 'done.invoke.identify',
  onboardingCompleted = 'done.invoke.onboarding',
  reset = 'reset',
}

export enum Actions {
  assignInitContext = 'assignInitContext',
  assignSandboxOutcome = 'assignSandboxOutcome',
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
  sandboxSuffix?: string;
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
      type: Events.sandboxOutcomeSubmitted;
      payload: {
        sandboxSuffix: string;
      };
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
