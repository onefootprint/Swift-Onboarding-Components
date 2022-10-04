import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  requiresAdditionalInfo,
  shouldRunCollectKycData,
  shouldRunCollectKycDataFromContext,
  shouldRunD2P,
  shouldRunD2PFromContext,
  shouldRunIdScan,
  shouldRunIdScanFromContext,
  shouldRunLiveness,
  shouldRunLivenessFromContext,
} from './machine.utils';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  States,
} from './types';

export type OnboardingRequirementsMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  tenant: TenantInfo;
  authToken?: string;
};

const createOnboardingRequirementsMachine = ({
  userFound,
  device,
  authToken,
  tenant,
}: OnboardingRequirementsMachineArgs) =>
  createMachine<MachineContext, MachineEvents>(
    {
      predictableActionArguments: true,
      id: 'onboarding-requirements',
      initial: States.checkOnboardingRequirements,
      context: {
        userFound,
        missingLiveness: false,
        missingIdDocument: false,
        missingKycData: [],
        kycData: {},
        device,
        authToken,
        tenant,
      },
      states: {
        [States.checkOnboardingRequirements]: {
          on: {
            [Events.onboardingRequirementsReceived]: [
              {
                cond: (context, event) =>
                  requiresAdditionalInfo(
                    context.userFound,
                    event.payload.missingKycData,
                    event.payload.missingIdDocument,
                  ),
                target: States.additionalInfoRequired,
                actions: [
                  Actions.assignMissingKycData,
                  Actions.assignMissingLiveness,
                  Actions.assignMissingIdDocument,
                ],
              },
              {
                target: States.collectKycData,
                cond: (context, event) =>
                  shouldRunCollectKycData(event.payload.missingKycData),
                actions: [
                  Actions.assignMissingKycData,
                  Actions.assignMissingLiveness,
                  Actions.assignMissingIdDocument,
                ],
              },
              {
                target: States.liveness,
                cond: (context, event) =>
                  shouldRunLiveness(
                    event.payload.missingLiveness,
                    context.device,
                  ),
                actions: [
                  Actions.assignMissingKycData,
                  Actions.assignMissingLiveness,
                  Actions.assignMissingIdDocument,
                ],
              },
              {
                target: States.idScan,
                cond: (context, event) =>
                  shouldRunIdScan(
                    event.payload.missingIdDocument,
                    context.device,
                  ),
                actions: [
                  Actions.assignMissingKycData,
                  Actions.assignMissingLiveness,
                  Actions.assignMissingIdDocument,
                ],
              },
              {
                target: States.d2p,
                cond: (context, event) =>
                  shouldRunD2P(
                    event.payload.missingIdDocument,
                    event.payload.missingLiveness,
                    context.device,
                  ),
                actions: [
                  Actions.assignMissingKycData,
                  Actions.assignMissingLiveness,
                  Actions.assignMissingIdDocument,
                ],
              },
              {
                target: States.success,
              },
            ],
          },
        },
        [States.additionalInfoRequired]: {
          on: {
            [Events.additionalInfoRequired]: [
              {
                target: States.collectKycData,
                cond: context => shouldRunCollectKycDataFromContext(context),
              },
              {
                target: States.liveness,
                description:
                  'If there are other attributes missing in addition to webauthn for an existing user, take them to liveness register, since the user likely abandoned onboarding early.',
                cond: context => shouldRunLivenessFromContext(context),
              },
              {
                target: States.idScan,
                cond: context => shouldRunIdScanFromContext(context),
              },
              {
                target: States.d2p,
                description:
                  'If we need to do webauthn but need to do a transfer first',
                cond: context => shouldRunD2PFromContext(context),
              },
              {
                target: States.success,
              },
            ],
          },
        },
        [States.collectKycData]: {
          on: {
            [Events.collectKycDataCompleted]: [
              {
                target: States.liveness,
                cond: context => shouldRunLivenessFromContext(context),
              },
              {
                target: States.idScan,
                cond: context => shouldRunIdScanFromContext(context),
              },
              {
                target: States.d2p,
                cond: context => shouldRunD2PFromContext(context),
              },
              {
                target: States.checkOnboardingRequirements,
              },
            ],
          },
        },
        [States.d2p]: {
          on: {
            [Events.d2pCompleted]: {
              target: States.checkOnboardingRequirements,
            },
          },
        },
        [States.liveness]: {
          on: {
            [Events.livenessCompleted]: [
              {
                target: States.idScan,
                cond: context => shouldRunIdScanFromContext(context),
              },
              {
                target: States.checkOnboardingRequirements,
              },
            ],
          },
        },
        [States.idScan]: {
          on: {
            [Events.idScanCompleted]: {
              target: States.checkOnboardingRequirements,
            },
          },
        },
        [States.success]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignMissingKycData]: assign((context, event) => {
          if (event.type === Events.onboardingRequirementsReceived) {
            context.missingKycData = [...event.payload.missingKycData];
          }
          return context;
        }),
        [Actions.assignMissingLiveness]: assign((context, event) => {
          if (event.type === Events.onboardingRequirementsReceived) {
            context.missingLiveness = event.payload.missingLiveness;
          }
          return context;
        }),
        [Actions.assignMissingIdDocument]: assign((context, event) => {
          if (event.type === Events.onboardingRequirementsReceived) {
            context.missingIdDocument = event.payload.missingIdDocument;
          }
          return context;
        }),
      },
    },
  );

export default createOnboardingRequirementsMachine;
