import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import {
  areRequirementsEmpty,
  RequirementCompletedTransitions,
  RequirementTargets,
  requiresAdditionalInfo,
} from './machine.utils';
import {
  Actions,
  Events,
  MachineContext,
  MachineEvents,
  Requirements,
  States,
} from './types';

export type OnboardingRequirementsMachineArgs = {
  userFound: boolean;
  device: DeviceInfo;
  tenant: TenantInfo;
  authToken: string;
};

const defaultRequirements: Requirements = {
  idDocRequestId: undefined,
  liveness: false,
  kycData: [],
  identityCheck: false,
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
        onboardingContext: {
          userFound,
          device,
          authToken,
          tenant,
        },
        requirements: defaultRequirements,
        receivedRequirements: defaultRequirements,
        kycData: {},
      },
      states: {
        [States.checkOnboardingRequirements]: {
          on: {
            [Events.onboardingRequirementsReceived]: [
              {
                target: States.success,
                cond: (context, event) => areRequirementsEmpty(event.payload),
              },
              {
                target: States.router,
                actions: [Actions.assignRequirements],
              },
            ],
          },
        },
        [States.router]: {
          always: [
            {
              cond: context => requiresAdditionalInfo(context),
              target: States.additionalInfoRequired,
            },
            ...RequirementTargets,
            {
              target: States.success,
            },
          ],
        },
        [States.additionalInfoRequired]: {
          on: {
            ...RequirementCompletedTransitions,
          },
        },
        [States.kycData]: {
          entry: [Actions.startKycData],
          on: {
            ...RequirementCompletedTransitions,
          },
        },
        [States.transfer]: {
          entry: [Actions.startTransfer],
          on: {
            ...RequirementCompletedTransitions,
          },
        },
        [States.idDoc]: {
          entry: [Actions.startIdDoc],
          on: {
            ...RequirementCompletedTransitions,
          },
        },
        [States.identityCheck]: {
          entry: [Actions.startIdentityCheck],
          on: {
            ...RequirementCompletedTransitions,
          },
        },
        [States.success]: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        [Actions.assignRequirements]: assign((context, event) => {
          if (event.type === Events.onboardingRequirementsReceived) {
            context.receivedRequirements = { ...event.payload };
            context.requirements = { ...event.payload };
          }
          return context;
        }),
        [Actions.startKycData]: assign(context => {
          context.requirements.kycData = [];
          return context;
        }),
        [Actions.startTransfer]: assign(context => {
          context.requirements.liveness = false;
          // If we are on mobile, idDoc plugin will run separately
          if (context.onboardingContext.device.type !== 'mobile') {
            context.requirements.idDocRequestId = undefined;
          }
          return context;
        }),
        [Actions.startIdDoc]: assign(context => {
          context.requirements.idDocRequestId = undefined;
          return context;
        }),
        [Actions.startIdentityCheck]: assign(context => {
          context.requirements.identityCheck = false;
          return context;
        }),
      },
    },
  );

export default createOnboardingRequirementsMachine;
