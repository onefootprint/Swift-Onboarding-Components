import { DeviceInfo } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { RequirementTargets, requiresAdditionalInfo } from './machine.utils';
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
  config: OnboardingConfig;
  authToken: string;
};

const defaultRequirements: Requirements = {
  idDoc: false,
  liveness: false,
  kycData: [],
  identityCheck: false,
};

const createOnboardingRequirementsMachine = ({
  userFound,
  device,
  authToken,
  config,
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
          config,
        },
        requirements: { ...defaultRequirements },
        kycData: {},
        startedDataCollection: false,
      },
      states: {
        [States.checkOnboardingRequirements]: {
          on: {
            [Events.onboardingRequirementsReceived]: {
              target: States.router,
              actions: [Actions.assignRequirements],
            },
          },
        },
        [States.router]: {
          always: [
            {
              target: States.additionalInfoRequired,
              cond: context => requiresAdditionalInfo(context),
            },
            ...RequirementTargets,
            {
              target: States.success,
            },
          ],
        },
        [States.additionalInfoRequired]: {
          entry: [Actions.startDataCollection],
          on: {
            [Events.requirementCompleted]: [
              ...RequirementTargets,
              {
                target: States.success,
              },
            ],
          },
        },
        [States.kycData]: {
          on: {
            [Events.requirementCompleted]: {
              target: States.checkOnboardingRequirements,
            },
          },
        },
        [States.transfer]: {
          on: {
            [Events.requirementCompleted]: {
              target: States.checkOnboardingRequirements,
            },
          },
        },
        [States.idDoc]: {
          on: {
            [Events.requirementCompleted]: {
              target: States.checkOnboardingRequirements,
            },
          },
        },
        [States.identityCheck]: {
          on: {
            [Events.requirementCompleted]: {
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
        [Actions.assignRequirements]: assign((context, event) => {
          if (event.type === Events.onboardingRequirementsReceived) {
            context.requirements = { ...event.payload };
          }
          return context;
        }),
        [Actions.startDataCollection]: assign(context => {
          context.startedDataCollection = true;
          return context;
        }),
      },
    },
  );

export default createOnboardingRequirementsMachine;
