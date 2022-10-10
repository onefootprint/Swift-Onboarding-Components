import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  requiresAdditionalInfo,
  shouldRunCollectKycData,
  shouldRunCollectKycDataFromContext,
  shouldRunIdScan,
  shouldRunIdScanFromContext,
  shouldRunTransfer,
  shouldRunTransferFromContext,
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
                target: States.transfer,
                cond: (context, event) =>
                  shouldRunTransfer(
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
                target: States.transfer,
                description:
                  'If we need to do webauthn but need to do a transfer first',
                cond: context => shouldRunTransferFromContext(context),
              },
              {
                target: States.idScan,
                cond: context => shouldRunIdScanFromContext(context),
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
                target: States.transfer,
                cond: context => shouldRunTransferFromContext(context),
              },
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
        [States.transfer]: {
          on: {
            [Events.transferCompleted]: {
              target: States.checkOnboardingRequirements,
            },
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
