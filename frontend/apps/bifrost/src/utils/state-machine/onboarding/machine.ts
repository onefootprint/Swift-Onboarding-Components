import { DeviceInfo } from '@onefootprint/hooks';
import { TenantInfo } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import createOnboardingRequirementsMachine from '../onboarding-requirements/machine';
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
      initial: States.initOnboarding,
      context: {
        userFound,
        device,
        authToken,
        tenant,
      },
      states: {
        [States.initOnboarding]: {
          on: {
            [Events.onboardingInitialized]: [
              {
                target: States.success,
                cond: (context, event) => !!event.payload.validationToken,
                actions: [Actions.assignValidationToken],
              },
              {
                target: States.onboardingRequirements,
              },
            ],
          },
        },
        [States.onboardingRequirements]: {
          invoke: {
            id: 'onboardingRequirements',
            src: context =>
              createOnboardingRequirementsMachine({
                userFound: context.userFound,
                device: context.device,
                authToken: context.authToken,
                tenant: context.tenant,
              }),
            onDone: {
              target: States.authorize,
            },
          },
        },
        [States.authorize]: {
          on: {
            [Events.authorized]: {
              target: States.success,
              actions: [Actions.assignValidationToken],
            },
          },
        },
        [States.success]: {
          type: 'final',
          data: {
            validationToken: (context: MachineContext) =>
              context.validationToken,
          },
        },
      },
    },
    {
      actions: {
        [Actions.assignValidationToken]: assign((context, event) => {
          if (event.type === Events.onboardingInitialized) {
            context.validationToken = event.payload.validationToken;
          }
          return context;
        }),
      },
    },
  );

export default createOnboardingMachine;
