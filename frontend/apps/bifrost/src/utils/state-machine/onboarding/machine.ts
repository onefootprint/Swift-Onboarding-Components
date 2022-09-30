import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  requiresAdditionalInfo,
  shouldRunCollectKycData,
  shouldRunD2P,
  shouldRunIdScan,
  shouldRunWebauthn,
} from './machine.utils';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

export type OnboardingMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  tenant: TenantInfo;
  authToken?: string;
};

const createOnboardingMachine = ({
  userFound,
  device,
  authToken,
  tenant,
}: OnboardingMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'onboarding',
      initial: States.onboardingVerification,
      context: {
        userFound,
        missingAttributes: [],
        missingWebauthnCredentials: false,
        missingIdScan: false,
        data: {},
        device,
        authToken,
        tenant,
      },
      states: {
        [States.onboardingVerification]: {
          on: {
            [Events.onboardingVerificationCompleted]: [
              {
                target: States.onboardingComplete,
                cond: (context, event) => !!event.payload.validationToken,
                actions: [
                  Actions.assignValidationToken,
                  Actions.assignMissingAttributes,
                  Actions.assignMissingWebauthnCredentials,
                  Actions.assignMissingIdScan,
                ],
              },
              {
                target: States.initOnboarding,
                actions: [
                  Actions.assignValidationToken,
                  Actions.assignMissingAttributes,
                  Actions.assignMissingWebauthnCredentials,
                  Actions.assignMissingIdScan,
                ],
              },
            ],
          },
        },
        [States.initOnboarding]: {
          always: [
            {
              cond: context => requiresAdditionalInfo(context),
              target: States.additionalInfoRequired,
            },
            {
              target: States.collectKycData,
              cond: context => shouldRunCollectKycData(context),
            },
            {
              target: States.webAuthn,
              cond: context => shouldRunWebauthn(context),
            },
            {
              target: States.idScan,
              cond: context => shouldRunIdScan(context),
            },
            {
              target: States.d2p,
              cond: context => shouldRunD2P(context),
            },
            {
              target: States.onboardingComplete,
            },
          ],
        },
        [States.additionalInfoRequired]: {
          on: {
            [Events.additionalInfoRequired]: [
              {
                target: States.collectKycData,
                cond: context => shouldRunCollectKycData(context),
              },
              {
                target: States.webAuthn,
                description:
                  'If there are other attributes missing in addition to webauthn for an existing user, take them to liveness register, since the user likely abandoned onboarding early.',
                cond: context => shouldRunWebauthn(context),
              },
              {
                target: States.idScan,
                cond: context => shouldRunIdScan(context),
              },
              {
                target: States.d2p,
                description:
                  'If we need to do webauthn but need to do a transfer first',
                cond: context => shouldRunD2P(context),
              },
              {
                target: States.onboardingComplete,
              },
            ],
          },
        },
        [States.d2p]: {
          on: {
            [Events.d2pCompleted]: {
              target: States.onboardingComplete,
            },
          },
        },
        [States.webAuthn]: {
          on: {
            [Events.webAuthnCompleted]: [
              {
                target: States.idScan,
                cond: context => shouldRunIdScan(context),
              },
              {
                target: States.onboardingComplete,
              },
            ],
          },
        },
        [States.collectKycData]: {
          on: {
            [Events.collectKycDataCompleted]: [
              {
                target: States.webAuthn,
                cond: context => shouldRunWebauthn(context),
              },
              {
                target: States.idScan,
                cond: context => shouldRunIdScan(context),
              },
              {
                target: States.d2p,
                cond: context => shouldRunD2P(context),
              },
              {
                target: States.onboardingComplete,
              },
            ],
          },
        },
        [States.idScan]: {
          on: {
            [Events.idScanCompleted]: {
              target: States.onboardingComplete,
            },
          },
        },
        [States.onboardingComplete]: {
          type: 'final',
          data: {
            onboardingData: (context: MachineContext) => context.data,
            missingWebauthnCredentials: (context: MachineContext) =>
              context.missingWebauthnCredentials,
            missingAttributes: (context: MachineContext) =>
              context.missingAttributes,
            validationToken: (context: MachineContext) =>
              context.validationToken,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignMissingAttributes]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.missingAttributes = [...event.payload.missingAttributes];
          }
          return context;
        }),
        [Actions.assignMissingWebauthnCredentials]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.missingWebauthnCredentials =
              event.payload.missingWebauthnCredentials;
          }
          return context;
        }),
        [Actions.assignMissingIdScan]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.missingIdScan = event.payload.missingIdScan;
          }
          return context;
        }),
        [Actions.assignValidationToken]: assign((context, event) => {
          if (event.type === Events.onboardingVerificationCompleted) {
            context.validationToken = event.payload.validationToken;
          }
          return context;
        }),
      },
    },
  );

export default createOnboardingMachine;
