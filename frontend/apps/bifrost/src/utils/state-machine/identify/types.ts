import { DeviceInfo } from '@onefootprint/hooks';
import {
  ChallengeKind,
  Identifier,
  OnboardingConfig,
} from '@onefootprint/types';

import { BootstrapData } from '../bifrost/types';

export enum States {
  initBootstrap = 'initBootstrap',
  bootstrapChallenge = 'bootstrapChallenge',
  emailIdentification = 'emailIdentification',
  phoneIdentification = 'phoneIdentification',
  challenge = 'challenge',
  success = 'success',
}

export type MachineContext = {
  config?: OnboardingConfig;
  device: DeviceInfo;
  bootstrapData: BootstrapData;
  identify: MachineIdentifyContext;
  challenge: MachineChallengeContext;
};

export type MachineIdentifyContext = {
  phoneNumber?: string;
  email?: string;
  userFound?: boolean;
  successfulIdentifier?: Identifier;
  identifierSuffix?: string;
};

export type MachineChallengeContext = {
  hasSyncablePassKey?: boolean;
  availableChallengeKinds?: ChallengeKind[];
  authToken?: string;
};

export enum Events {
  bootstrapDataInvalid = 'bootstrapDataInvalid',
  identified = 'identified',
  identifyFailed = 'identifyFailed',
  identifyReset = 'identifyReset',
  navigatedToPrevPage = 'navigatedToPrevPage',
  challengeSucceeded = 'challengeSucceeded',
  challengeFailed = 'challengeFailed',
}

export enum Actions {
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

type BootstrapEvents = {
  type: Events.bootstrapDataInvalid;
};

type IdentifyEvents =
  | {
      type: Events.identified;
      payload: {
        email?: string;
        phoneNumber?: string;
        successfulIdentifier?: Identifier;
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
      type: Events.challengeSucceeded;
      payload: {
        authToken: string;
      };
    }
  | { type: Events.challengeFailed };

type OtherEvents = { type: Events.navigatedToPrevPage };
