import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingRequirements, TenantInfo } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  requiresAdditionalInfo,
  shouldRunCollectKycData,
  shouldRunCollectKycDataFromContext,
  shouldRunD2P,
  shouldRunD2PFromContext,
  shouldRunIdScan,
  shouldRunIdScanFromContext,
  shouldRunWebauthn,
  shouldRunWebauthnFromContext,
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
                  event.payload.requirements.length === 0,
                target: States.success,
              },
              {
                cond: (context, event) =>
                  requiresAdditionalInfo(
                    context.userFound,
                    event.payload.requirements,
                  ),
                target: States.additionalInfoRequired,
              },
              {
                target: States.collectKycData,
                cond: (context, event) =>
                  shouldRunCollectKycData(event.payload.missingKycData),
              },
              {
                target: States.webAuthn,
                cond: (context, event) =>
                  shouldRunWebauthn(event.payload.requirements, context.device),
              },
              {
                target: States.idScan,
                cond: (context, event) =>
                  shouldRunIdScan(event.payload.requirements, context.device),
              },
              {
                target: States.d2p,
                cond: (context, event) =>
                  shouldRunD2P(event.payload.requirements, context.device),
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
                target: States.webAuthn,
                description:
                  'If there are other attributes missing in addition to webauthn for an existing user, take them to liveness register, since the user likely abandoned onboarding early.',
                cond: context => shouldRunWebauthnFromContext(context),
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
            ],
          },
        },
        [States.collectKycData]: {
          on: {
            [Events.collectKycDataCompleted]: [
              {
                target: States.webAuthn,
                cond: context => shouldRunWebauthnFromContext(context),
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
        [States.webAuthn]: {
          on: {
            [Events.webAuthnCompleted]: [
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
          if (event.type !== Events.onboardingRequirementsReceived) {
            return context;
          }
          const { requirements, missingKycData } = event.payload;
          if (
            requirements.includes(OnboardingRequirements.collectKycData) &&
            missingKycData?.length
          ) {
            context.missingKycData = [...missingKycData];
          }
          return context;
        }),
        [Actions.assignMissingLiveness]: assign((context, event) => {
          if (event.type !== Events.onboardingRequirementsReceived) {
            return context;
          }
          const { requirements } = event.payload;
          if (requirements.includes(OnboardingRequirements.liveness)) {
            context.missingLiveness = true;
          }
          return context;
        }),
        [Actions.assignMissingIdDocument]: assign((context, event) => {
          if (event.type !== Events.onboardingRequirementsReceived) {
            return context;
          }
          const { requirements } = event.payload;
          if (requirements.includes(OnboardingRequirements.collectDocument)) {
            context.missingLiveness = true;
          }

          return context;
        }),
      },
    },
  );

export default createOnboardingRequirementsMachine;
